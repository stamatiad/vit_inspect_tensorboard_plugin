# Copyright 2017 The TensorFlow Authors. All Rights Reserved.
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
"""
Internal information about the vit_inspect plugin.
It is essentially the images plugin metadata, but modified for vit_inspect.
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from tensorboard.compat.proto import summary_pb2
#from tensorboard.plugins.image import plugin_data_pb2
from tensorboard.util import tb_logging

logger = tb_logging.get_logger()

PLUGIN_NAME = "vit_inspect"

# The most recent value for the `version` field of the `ImagePluginData`
# proto.
PROTO_VERSION = 0


def create_summary_metadata(description):
    """Create a `summary_pb2.SummaryMetadata` proto for image plugin data.
    Check here for documentation:
    https://www.tensorflow.org/api_docs/python/tf/compat/v1/SummaryMetadata

    Returns:
      A `summary_pb2.SummaryMetadata` protobuf object.
    """
    # TODO: return generic metadata and check if custom summaries load!
    #content = plugin_data_pb2.ImagePluginData(version=PROTO_VERSION)
    metadata = summary_pb2.SummaryMetadata(
        #display_name=display_name,
        summary_description=description,
        # Data that associate the summary with our plugin
        # https://github.com/tensorflow/tensorboard/blob/df448ad1200768e0ed9241038a6c9a969bc37109/tensorboard/compat/proto/summary.proto
        plugin_data=summary_pb2.SummaryMetadata.PluginData(
            plugin_name=PLUGIN_NAME,
            content=b''#content.SerializeToString()
        ),
        data_class=summary_pb2.DATA_CLASS_BLOB_SEQUENCE,
    )
    return metadata

