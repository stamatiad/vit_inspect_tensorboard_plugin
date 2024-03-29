# Copyright 2018 The TensorFlow Authors. All Rights Reserved.
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
"""Image summaries and TensorFlow operations to create them, V2 versions.

An image summary stores the width, height, and PNG-encoded data for zero
or more images in a rank-1 string array: `[w, h, png0, png1, ...]`.
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from tensorboard.compat import tf2 as tf
from . import metadata
from tensorboard.util import lazy_tensor_creator


def vi_summary(name, data, step=None, description=None):
    """Write an image summary.

    Arguments:
      name: A name for this summary. The summary tag used for TensorBoard will
        be this name prefixed by any active name scopes.
      data: A `Tensor` representing pixel data with shape `[k, h, w, c]`,
        where `k` is the number of images, `h` and `w` are the height and
        width of the images, and `c` is the number of channels, which
        should be 1, 2, 3, or 4 (grayscale, grayscale with alpha, RGB, RGBA).
        Any of the dimensions may be statically unknown (i.e., `None`).
        Floating point data will be clipped to the range [0,1).
      step: Explicit `int64`-castable monotonic step value for this summary. If
        omitted, this defaults to `tf.summary.experimental.get_step()`, which must
        not be None.
      description: Optional long-form description for this summary, as a
        constant `str`. Markdown is supported. Defaults to empty.

    Returns:
      True on success, or false if no summary was emitted because no default
      summary writer was available.

    Raises:
      ValueError: if a default writer exists, but no step was provided and
        `tf.summary.experimental.get_step()` is None.
    """
    # Plugin specific metadata. These are read from TB to know what type of
    # summaries the logdir contains. Keep them vit_inspect.
    summary_metadata = metadata.create_summary_metadata(
        description=description
    )
    # TODO(https://github.com/tensorflow/tensorboard/issues/2109): remove fallback
    summary_scope = (
        getattr(tf.summary.experimental, "summary_scope", None)
        or tf.summary.summary_scope
    )
    with summary_scope(
        name, "vit_inspect_summary", values=[data, step]
    ) as (tag, _):
        # Defer image encoding preprocessing by passing it as a callable to write(),
        # wrapped in a LazyTensorCreator for backwards compatibility, so that we
        # only do this work when summaries are actually written.
        @lazy_tensor_creator.LazyTensorCreator
        def lazy_tensor():
            tf.debugging.assert_rank(data, 4)
            images = tf.image.convert_image_dtype(data, tf.uint8, saturate=True)
            #TODO: For map to work  as expected you need to have a 4d tensor as
            # input. Double check this!
            encoded_images = tf.map_fn(
                tf.image.encode_png,
                images,
                dtype=tf.string,
                name="encode_each_image",
            )
            # Workaround for map_fn returning float dtype for an empty elems input.
            # Ensure that the resulting tensor is fo type string!
            encoded_images = tf.cond(
                tf.shape(input=encoded_images)[0] > 0,
                lambda: encoded_images,
                lambda: tf.constant([], tf.string),
            )
            image_shape = tf.shape(input=images)
            dimensions = tf.stack(
                [
                    tf.as_string(image_shape[2], name="width"),
                    tf.as_string(image_shape[1], name="height"),
                ],
                name="dimensions",
            )
            # Return four string tensors:
            return tf.concat([dimensions, encoded_images], axis=0)

        # To ensure that image encoding logic is only executed when summaries
        # are written, we pass callable to `tensor` parameter.
        return tf.summary.write(
            tag=tag, tensor=lazy_tensor, step=step, metadata=summary_metadata
        )
