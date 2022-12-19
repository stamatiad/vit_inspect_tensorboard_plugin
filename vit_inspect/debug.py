from flask import Flask, render_template, send_file, request
import os, sys
from pathlib import Path

app = Flask(__name__)

@app.route("/")
def entrypoint():
    print(f"ENTRYPOINTTTTT", file=sys.stdout)
    return render_template("debug.html")

@app.route('/plugin/vit_inspect/individualImage')
def individualImage():
    filename = Path(os.getcwd()).joinpath('static').joinpath('img')\
        .joinpath(f"{request.args.get('blob_key')}.png")
    print(f"returning image: {filename}", file=sys.stdout)
    return send_file(filename, mimetype='image/png')