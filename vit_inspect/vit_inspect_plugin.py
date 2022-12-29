# Copyright 2019 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""A sample plugin to demonstrate dynamic loading."""


import json
import os
import imghdr

from tensorboard import plugin_util
from tensorboard.data import provider
from tensorboard.plugins import base_plugin
from tensorboard.backend import http_util
import werkzeug
from werkzeug import wrappers
import urllib

from vit_inspect import metadata
import re



_IMGHDR_TO_MIMETYPE = {
    "png": "image/png",
}

_DEFAULT_IMAGE_MIMETYPE = "application/octet-stream"
_DEFAULT_DOWNSAMPLING = 10  # images per time series

# Debug info:
import pydevd_pycharm
pydevd_pycharm.settrace('localhost', port=4444, stdoutToServer=True, stderrToServer=True)


class VitInspectPlugin(base_plugin.TBPlugin):
    plugin_name = metadata.PLUGIN_NAME
    downsample_to = 1000

    def __init__(self, context):
        """Instantiates VitInspectPlugin. By definition, we assume that any
        of the context params can be None.

        Args:
        context: A base_plugin.TBContext instance.
        """
        # See here:
        # https://github.com/tensorflow/tensorboard/blob/master/tensorboard/backend/event_processing/plugin_event_multiplexer.py

        if context.data_provider is None:
            raise ValueError(f"Vit Inspect Plugin context, passed from TB to "
                             f"the plugin init() is None!")

        # Checking in backend/application.py, context.multiplexes should be
        # none.
        print("Initializing VIT INSPECT PLUGIN...")
        self.data_provider = context.data_provider

        # Keep a dict with debug info, that you can pass to the frontent if
        # needed:
        self.debug_info = {}
        # self.debug_info['context'] =

        if False:
            #This seesm to get my runs!
            runs = self.multiplexer.Runs()
            events = self.multiplexer.Tensors(".", "ViT16")
            content = self.multiplexer.PluginRunToTagToContent("vit_inspect")


        if False:
            # How list plugins works?
            #tensorboard/backend/event_processing/data_provider.py
            # list_plugins(), might have timeseries with DATA_CLASS_UNKNOWN

            #TODO: can you load individual runs with EventMultiplexer? From
            # backend/event_processing/plugin_event_multiplexer.py

            # Gather some info about what summaries exist:
            print(
                self.data_provider.list_plugins(
                    ctx=context, experiment_id=""
                )
            )
            # So we only wrote with 'images' plugin. Lets get the events:
            # INFO: the run_tag_filter and downsample is mandatory!
            event = self.data_provider.read_blob_sequences(
                ctx=context,
                experiment_id="",
                plugin_name=self.plugin_name,
                downsample=self.downsample_to,
                run_tag_filter=provider.RunTagFilter(runs=["."], tags=["ViT16"]),
            )

            datum = event["."]["ViT16"][0]
            for val in range(len(datum.values)):
                print(self._data_provider_query(datum.values[val]))

            # Get image data:
            ctx = context
            blob_key = datum.values[3].blob_key
            data = self._get_generic_data_individual_image(ctx, blob_key)
            image_type = imghdr.what(None, data)
            content_type = _IMGHDR_TO_MIMETYPE.get(
                image_type, _DEFAULT_IMAGE_MIMETYPE
            )


            # From tensorboard/data/provider.py
            # Get the blob_keys:
            blob = self.data_provider.read_blob_sequences(
                context, "", self.plugin_name, 1000
            )


    def get_plugin_apps(self):
        # TODO: rename main to entrypoint.
        return {
            "/main": self._serve_js,
            #"/main.css": self._serve_css,
            "/images": self._serve_image_metadata,
            "/individualImage": self._serve_individual_image,
            "/tags": self._serve_tags,
        }

    def is_active(self):
        """Returns whether there is relevant data for the plugin to process.

        When there are no runs with greeting data, TensorBoard will hide the
        plugin from the main navigation bar.
        """
        return False  # `list_plugins` as called by TB core suffices

    def frontend_metadata(self):
        return base_plugin.FrontendMetadata(
            es_module_path="/main")

    @wrappers.Request.application
    def _serve_js(self, request):
        """
        This serves the ES module that is the entry point to the plugin.
        :param request:
        :return:
        """
        del request  # unused
        filepath = os.path.join(os.path.dirname(__file__), "static", "js", "main.js")
        with open(filepath) as infile:
            contents = infile.read()
        return werkzeug.Response(contents, content_type="text/javascript")

    @wrappers.Request.application
    def _serve_css(self, request):
        """
        This serves the CSS for the plugin.
        :param request:
        :return:
        """
        del request  # unused
        filepath = os.path.join(os.path.dirname(__file__), "static", "css",
                                "main.css")
        with open(filepath) as infile:
            contents = infile.read()
        return werkzeug.Response(contents, content_type="text/css")

    def _index_impl(self, ctx, experiment):
        mapping = self.data_provider.list_blob_sequences(
            ctx,
            experiment_id=experiment,
            plugin_name=self.plugin_name,
            # Normally you don't know runs or tags. Just checking here...
            #run_tag_filter=provider.RunTagFilter(runs=["."], tags=["ViT16"]),
        )
        result = {run: {} for run in mapping}
        for (run, tag_to_content) in iter(mapping.items()):
            for (tag, metadatum) in iter(tag_to_content.items()):
                description = plugin_util.markdown_to_safe_html(
                    metadatum.description
                )
                result[run][tag] = {
                    "displayName": metadatum.display_name,
                    "description": description,
                    "samples": metadatum.max_length - 2,  # width, height
                }
        return result

    @wrappers.Request.application
    def _serve_image_metadata(self, request):
        """Given a tag and list of runs, serve a list of metadata for images.

        Note that the images themselves are not sent; instead, we respond with URLs
        to the images. The frontend should treat these URLs as opaque and should not
        try to parse information about them or generate them itself, as the format
        may change.

        Args:
          request: A werkzeug.wrappers.Request object.

        Returns:
          A werkzeug.Response application.
        """
        ctx = plugin_util.context(request.environ)
        experiment = plugin_util.experiment_id(request.environ)
        tag = request.args.get("tag")
        run = request.args.get("run")
        sample = int(request.args.get("sample", 0))
        try:
            response = self._image_response_for_run(
                ctx, experiment, run, tag, sample
            )
        except KeyError:
            return http_util.Respond(
                request, "Invalid run or tag", "text/plain", code=400
            )
        return http_util.Respond(request, response, "application/json")

    def _image_response_for_run(self, ctx, experiment, run, tag, sample):
        """Builds a JSON-serializable object with information about images.

        Args:
          run: The name of the run.
          tag: The name of the tag the images all belong to.
          sample: The zero-indexed sample of the image for which to retrieve
            information. For instance, setting `sample` to `2` will fetch
            information about only the third image of each batch. Steps with
            fewer than three images will be omitted from the results.

        Returns:
          A list of dictionaries containing the wall time, step, and URL
          for each image.

        Raises:
          KeyError, NotFoundError: If no image data exists for the given
            parameters.
        """
        all_images = self.data_provider.read_blob_sequences(
            ctx,
            experiment_id=experiment,
            plugin_name=self.plugin_name,
            downsample=self.downsample_to,
            run_tag_filter=provider.RunTagFilter(runs=[run], tags=[tag]),
        )
        images = all_images.get(run, {}).get(tag, None)
        if images is None:
            raise FileNotFoundError(
                "No image data for run=%r, tag=%r" % (run, tag)
            )
        return [
            {
                "wall_time": datum.wall_time,
                "step": datum.step,
                "blob_key": datum.values[sample + 2].blob_key
            }
            for datum in images
            if len(datum.values) - 2 > sample
        ]

    def _filter_by_sample(self, tensor_events, sample):
        return [
            tensor_event
            for tensor_event in tensor_events
            if (
                    len(tensor_event.tensor_proto.string_val) - 2  # width, height
                    > sample
            )
        ]

    def _query_for_individual_image(self, run, tag, sample, index):
        """Builds a URL for accessing the specified image.

        This should be kept in sync with _serve_image_metadata. Note that the URL is
        *not* guaranteed to always return the same image, since images may be
        unloaded from the reservoir as new images come in.

        Args:
          run: The name of the run.
          tag: The tag.
          sample: The relevant sample index, zero-indexed. See documentation
            on `_image_response_for_run` for more details.
          index: The index of the image. Negative values are OK.

        Returns:
          A string representation of a URL that will load the index-th sampled image
          in the given run with the given tag.
        """
        query_string = urllib.parse.urlencode(
            {"run": run, "tag": tag, "sample": sample, "index": index,}
        )
        return query_string

    def _data_provider_query(self, blob_reference):
        return urllib.parse.urlencode({"blob_key": blob_reference.blob_key})

    def _get_generic_data_individual_image(self, ctx, blob_key):
        """Returns the actual image bytes for a given image.

        Args:
          blob_key: As returned by a previous `read_blob_sequences` call.

        Returns:
          A bytestring of the raw image bytes.
        """
        return self.data_provider.read_blob(ctx, blob_key=blob_key)

    @wrappers.Request.application
    def _serve_individual_image(self, request):
        """Serves an individual image."""
        try:
            ctx = plugin_util.context(request.environ)
            blob_key = request.args["blob_key"]
            data = self._get_generic_data_individual_image(ctx, blob_key)
        except (KeyError, IndexError):
            return http_util.Respond(
                request,
                "Invalid run, tag, index, or sample",
                "text/plain",
                code=400,
            )
        image_type = imghdr.what(None, data)
        content_type = _IMGHDR_TO_MIMETYPE.get(
            image_type, _DEFAULT_IMAGE_MIMETYPE
        )
        return http_util.Respond(request, data, content_type)

    @wrappers.Request.application
    def _serve_tags(self, request):
        ctx = plugin_util.context(request.environ)
        experiment = plugin_util.experiment_id(request.environ)
        index = self._index_impl(ctx, experiment)
        # We need to return the different batches that we have runs for:
        # TODO: do not assume default run "."!!!
        batch_ids = {run: {} for run in index}
        for run, run_vals in index.items():
            for tag, description in run_vals.items():
                if re.fullmatch("b[0-9]*", tag):
                    batch_ids[run][tag] = description
        # Check that the mandatory downsample property allows us to get all
        # the requested weight matrices:
        # TODO: implement a check that prevents pruning of samples:
        #if self._downsample_to < index['.']['ViT16']['samples']:
        #    self._downsample_to = index['.']['ViT16']['samples']
        # Request, content, content_type:
        return http_util.Respond(request, batch_ids, "application/json")
