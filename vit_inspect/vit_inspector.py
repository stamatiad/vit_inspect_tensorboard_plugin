import numpy as np
# Colab defaults to pre 3.5 matplotlib. So use the old cmaps syntax and not
# the newer ColormapRegistry:
# https://matplotlib.org/stable/api/prev_api_changes/api_changes_3.6.0.html#pending-deprecation-top-level-cmap-registration-and-access-functions-in-mpl-cm
import matplotlib.cm as cmaps
import tensorflow as tf
from contextlib import contextmanager
from vit_inspect.summary_v2 import vi_summary
import json



# These are the hidden vit inspector params:
_summary_is_active = False

# In order these to be accessible it needs to be mutable:
# Keep a params dict, to pass it around modules and front/back ends.
params = {}
params["num_layers"] = 12
params["num_heads"] = 12
params["num_tokens"] = 50
params["step"] = 0
params["batch_id"] = 0
# Create a summary writer to save the input image/batch and the attention
# map later on.
writer = tf.summary.create_file_writer("vi_logs")
#save_att_weights = False

@contextmanager
def enabled():
    """
    The vit inspect context manager, to enable inspection only during
    execution and not during initialization.
    """
    global _summary_is_active
    _summary_is_active = True
    try:
        yield None
    finally:
        _summary_is_active = False

def create_model_thumbnail(img):
    # Saves the image into the summary:
    arrimg = np.asarray(img)
    if len(arrimg.shape) < 3:
        raise ValueError("Image should be a square matrix with 3 channels!")
    if len(arrimg.shape) == 3:
        arrimg = np.expand_dims(arrimg, axis=0)
    # Make sure image's channels is the last dim:
    if arrimg.shape[-1] > arrimg.shape[1]:
        arrimg = np.moveaxis(arrimg, 1, -1)
    flat_arr_rgb = tf.convert_to_tensor(
        arrimg
    )
    with writer.as_default():
        vi_summary(
            f"b{params['batch_id']}",
            flat_arr_rgb,
            step=params["step"],
            description=json.dumps(params)
        )
        writer.flush()

def maps_to_imgs(arr):
    """
    Converts a ndarray of images, plotted with the desired colormap. Then
    proceeds to save them as rgb values for later handling with
    tf.writer.image. Also saves the images as one image pixel per monitor
    pixel. These will be scaled (maintaining pixelation) by the frontend, so
    to be fast and efficient in loading

    :param arr:
    :return:
    """

    # TODO: Again, the total dims and reshaping should be handled more
    #  generally, not for the specific example.
    # TODO: ALSO, these should be softmaxed so normalized to one?
    arr_rgb = cmaps.get_cmap('viridis')(arr)[..., :3]

    return arr_rgb
