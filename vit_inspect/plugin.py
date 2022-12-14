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

from vit_inspect import metadata



_IMGHDR_TO_MIMETYPE = {
    "png": "image/png",
}

_DEFAULT_IMAGE_MIMETYPE = "application/octet-stream"
_DEFAULT_DOWNSAMPLING = 10  # images per time series

# Debug info:
import pydevd_pycharm
pydevd_pycharm.settrace('localhost', port=4444, stdoutToServer=True, stderrToServer=True)


class VitInspect(base_plugin.TBPlugin):
    plugin_name = metadata.PLUGIN_NAME

    def __init__(self, context):
        """Instantiates ExamplePlugin.

        Args:
        context: A base_plugin.TBContext instance.
        """
        # See here:
        # https://github.com/tensorflow/tensorboard/blob/master/tensorboard/backend/event_processing/plugin_event_multiplexer.py
        self.data_provider = context.data_provider

    def is_active(self):
        """Returns whether there is relevant data for the plugin to process.

        When there are no runs with greeting data, TensorBoard will hide the
        plugin from the main navigation bar.
        """
        return False  # `list_plugins` as called by TB core suffices

    def get_plugin_apps(self):
        return {
            "/main.js": self._serve_js,
            "/tags": self._serve_tags,
            "/attn_weights": self._serve_attn_weights,
        }

    def frontend_metadata(self):
        return base_plugin.FrontendMetadata(es_module_path="/main.js")

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
    def _serve_tags(self, request):
        """
        Make this to serve the tags saved by our custom writer.

        Replicate in Postman:
        GET: http://localhost:6006/data/plugin/vit_inspect/tags

        :param request:
        :return:
        """
        ctx = plugin_util.context(request.environ)
        experiment = plugin_util.experiment_id(request.environ)

        mapping = self.data_provider.list_tensors(
            ctx, experiment_id=experiment, plugin_name=metadata.PLUGIN_NAME
        )

        result = {run: {} for run in mapping}
        for (run, tag_to_timeseries) in mapping.items():
            for (tag, timeseries) in tag_to_timeseries.items():
                result[run][tag] = {
                    "description": timeseries.description,
                }
        contents = json.dumps(result, sort_keys=True)
        return werkzeug.Response(contents, content_type="application/json")

    @wrappers.Request.application
    def _serve_attn_weights(self, request):
        """Serves attention weights data for the specified tag and run.

        For details on how to use tags and runs, see
        https://github.com/tensorflow/tensorboard#tags-giving-names-to-data
        """
        run = request.args.get("run")
        tag = request.args.get("tag")
        ctx = plugin_util.context(request.environ)
        experiment = plugin_util.experiment_id(request.environ)

        if run is None or tag is None:
            raise werkzeug.exceptions.BadRequest("Must specify run and tag")
        read_result = self.data_provider.read_tensors(
            ctx,
            downsample=10000,
            plugin_name=metadata.PLUGIN_NAME,
            experiment_id=experiment,
            run_tag_filter=provider.RunTagFilter(runs=[run], tags=[tag]),
        )

        data = read_result.get(run, {}).get(tag, [])
        if not data:
            raise werkzeug.exceptions.BadRequest("Invalid run or tag")

        event_data = None
        #event_data = [datum.numpy.item().decode("utf-8") for datum in data]

        contents = json.dumps(event_data, sort_keys=True)
        return werkzeug.Response(contents, content_type="application/json")

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
        """
        This will serve an image
        :param request:
        :return:
        """
        try:
            ctx = plugin_util.context(request.environ)
            # TODO: What is this
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