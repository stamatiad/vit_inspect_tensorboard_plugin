# ViT Inspect TensorBoard plugin

## Overview

ViT inspect (VI) is a plugin to enable inspection of representations learned by 
ViT models. 
Its goal is to be highly flexible and easy to integrate ('plug-and-play') 
on python models.

![Screenshot](vit_inspect/docs/overview.gif "Basic example")

## Features
- We provide a custom TensorBoard (TB) summary writer that can be flexibly
  added to any python model (Tensorflow, Keras and Pytorch) since it's
  just an import away!
- The plugin is based on the existing TB backend, so one can 
  run it standalone or inside Jupyter or Colab notebooks.
- Implements a responsive, asynchronous UI, while maintaining a 
  hierarchical component structure for relatively easy UI 
  addition/rearrangement if its desirable in the 
  future.
- We provide some example code for popular ViT models/libraries.



## Running the examples
We have implemented simple examples of pre-trained models that you can run 
on notebooks. They describe step by step the process and code for recording and 
visualizing ViT attention maps. You can try the following examples of existing, 
known 
repos:
* Self-Supervised Vision Transformers with DINO (PyTorch):
  * `https://github.com/facebookresearch/dino`
    [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://github.com/stamatiad/vit_inspect_tensorboard_plugin/blob/develop/examples/vi_example.ipynb)
* TensorFlow (TODO)
  * (TODO)

## Installation

> Please use the above example notebooks since the VI is private for the 
> time being. One needs active GitHub PAT for cloning the repo. Contact my 
> supervisor or me to get you one.

1. Just clone the ViT Inspect repo: 
```shell
git clone https://github.com/stamatiad/vit_inspect_tensorboard_plugin.git
```
2. Set up VI using setup tools:
```shell
cd vit_inspect_tensorboard_plugin
pip install .
```

3. You can uninstall it, similarly by running:
```shell
pip uninstall vit_inspect
```

> If you want to rebuild it or customize it, install VI in develop mode:
> ```python
> python setup.py develop
>```
> And uninstall it:
> ```python
> python setup.py develop -u
>```
> 

## Usage
1. Import VI to your project and model files. You will need the:
   * `vit_inspector` module, imported to both your inference and your model 
     python files, to share parameters.
   * `vi_summary` to save the maps and a representative image of their batch.
```python
from vit_inspect import vit_inspector as vi
from vit_inspect.summary_v2 import vi_summary
```
2. Inform the `vit_inspector` about your model parameters. The later you will 
   be available inside other modules that import it and will use it inside 
   our custom attention recording function. 
```python
vi.params["num_layers"] = 12
vi.params["num_heads"] = 6
...
```
3. In order to record the attention maps, you need to locate the function 
   that returns them. This will vary based on the model implementation. You can 
   wrap the attention function with you custom recording function, so you get 
   and record the maps. In case the attention function is part of a library, 
   you (possibly) can provide the library with a custom attention function, 
   so use yours (as in our TF example).
```python
 @rec_attn_weights
 def forward(self, x):
     B, N, C = x.shape
     qkv = self.qkv(x)....
```
4. If you are loading a pre-trained model, just to record the attention maps,
   do not forget to create a new instance of the model, so your custom 
   attention function is used, instead of the default one!
```python
# Load PyTorch pre-trained model:
model_cached = torch.hub.load('facebookresearch/dino:main', 'dino_vits16')
# Create a version of the model that holds our attention VI modifications:
model = VisionTransformer(embed_dim=num_features)
model.load_state_dict(model_cached.state_dict(), strict=False)
```
5. We suggest to save an image representing the batch, so it is easier to 
   pick the right model later, visually.
```python
# Save the image into the summary:
flat_arr_rgb = tf.convert_to_tensor(
    # Make sure image's channels is the last dim:
    np.moveaxis(np.asarray(img), 1, -1)
)
with vi.writer.as_default():
    step = 0
    batch_id = 0
    vi.params["step"] = 0
    vi.params["batch_id"] = batch_id
    vi_summary(
        f"b{batch_id}", #<-- For now this naming convention is important!
        flat_arr_rgb,
        step=step,
        description=json.dumps(vi.params)
    )
    vi.writer.flush()

```
6. We have implemented a context manager, so you can record the attention 
   maps, only when you need and not in every inference:
```python
with vi.enable_vi():
    # Now running the model will trigger our custom recording function
    attentions = model.get_last_selfattention(img.to(device))

```
7. Run the TB for the `vi_logs` folder created inside your model's home dir:
```shell
tensorboard --logdir vi_logs
```

## Build the UI from source

1. Cd to the plugin directory
```shell
cd vit_inspect
```
2. Run the npm to install the depenencies
```shell
npm install
```
3. Enable debug on your python editor, so you can step the code after the TB
   loads the VI.
4. Run the TB, directing it to the summary log directory 
```shell
tensorboard --logdir vi_logs
```
