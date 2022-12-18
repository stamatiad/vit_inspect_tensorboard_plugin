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
from matplotlib import pyplot as plt
import glob, os
from pathlib import Path


from vit_inspect import vit_inspect_summary


def plot_to_ndarray(arr):
    """
    Converts a ndarray of images, ploted with the desired colormap. Then
    proceeds to save them as rgb values for later handling with
    tf.writer.image. Also saves the images as one image pixel per monitor
    pixel. These will be scaled (maintaining pixelation) by the frontend, so
    to be fast and efficient in loading

    :param arr:
    :return:
    """
    # Get dims, ignoring batch dim if given:
    c, ki, kj, q, h, l, = list(np.flip(arr.shape))
    # Initialize the RGB array, with 3 channels:
    arr_rgb = np.zeros((*arr.shape[:-1], 3), np.uint8)

    fig = plt.figure(dpi=1)
    # TODO: save figure with the same dims as the image. Scale it in the
    #  front end, so loading will be superfast.
    fig.set_size_inches((kj, ki))
    ax = plt.Axes(fig, [0., 0., 1., 1.])
    ax.set_axis_off()
    fig.add_axes(ax)
    for layer in range(l):
        for head in range(h):
            for q_pixel in range(q):
                ax.imshow(
                    arr[layer, head, q_pixel, :, :, :],
                    cmap='viridis', aspect='equal'
                )
                fig.canvas.draw()
                ndarr = np.frombuffer(
                    fig.canvas.tostring_rgb(), dtype=np.uint8
                )
                ndarr = ndarr.reshape(
                    fig.canvas.get_width_height()[::-1] + (3,)
                )
                arr_rgb[layer, head, q_pixel, :, :, :] = ndarr
    return arr_rgb


def main(unused_argv):
    """
    This is a simple example.
    > Reads ndarrays from the TF model,
    > Converts them to images with proper colormap,
    > Writes them utilizing the default image summary writer.

    :param unused_argv:
    :return:
    """


    W_att = np.load("attn_weights.npy")
    blah = W_att[:, :, :, :49, :49].reshape(-1, 12, 12, 49, 7, 7)
    A_img = np.expand_dims(blah, -1)
    # This is a more detailed view: the Wa per pixel:
    pixel = 6
    # Save each image in a ndarray, but utilizing colormaps from matplotlib,
    # to better visualize the resulting weights.

    # Dims: #layers, #heads, #query, #key, #key, #channel:
    attn_w_array = np.mean(
        A_img[:, :, :, :, :, :, :], axis=0
    )

    #arr_rgb = plot_to_ndarray(attn_w_array[:2, :2, :, :, :, :])
    #np.save("arr_rgb.npy", arr_rgb)
    arr_rgb = np.load("arr_rgb.npy")

    print("done")

    log_dir = "attn_w_logs"
    writer = tf.summary.create_file_writer(log_dir)
    with writer.as_default():
        # flatten the attention weights rgb, to a 4d tensor: num, w, h, c
        flat_arr_rgb = tf.convert_to_tensor(
            np.reshape(arr_rgb, [-1, *arr_rgb.shape[-3:]])
        )
        tf.summary.image(
            "ViT16",
            flat_arr_rgb,
            step=0,
            max_outputs=flat_arr_rgb.shape[0],
            description="16x16"
        )

    # Check what the tf.summary.writer actually wrote:
    pathstr = str(Path(os.getcwd()).joinpath(log_dir).joinpath("*.*"))
    event_files = sorted(glob.glob(pathstr))
    events = list(tf.compat.v1.train.summary_iterator(event_files[0]))
    #TODO: What is this first event with no summary, named "brain.Event"?


if __name__ == "__main__":
    main(None)
