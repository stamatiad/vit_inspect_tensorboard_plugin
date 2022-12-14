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
# Experimental code

from absl import app
import tensorflow as tf
import numpy as np

from vit_inspect import vit_inspect_summary


def main(unused_argv):
    mat = np.random.rand(10, 10)
    writer = tf.summary.create_file_writer("attn_logs")
    with writer.as_default():
        vit_inspect_summary.attn_w_summary(
            "ViT16",
            mat,
            step=0,
            description="16x16"
        )
        # no need for `description`
        vit_inspect_summary.attn_w_summary(
            "ViT32",
            mat,
            step=1,
            description="32x32"
        )


if __name__ == "__main__":
    app.run(main)
