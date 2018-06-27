from flask import Flask, Blueprint, render_template, request, redirect, url_for, abort
import logging
import subprocess
import sys
import tempfile


class AppState:
    process = None  # type: subprocess.Popen

    def __init__(self):
        self.running = False
        self.process = None


appstate = AppState()
assert not appstate.running


website = Blueprint("website", __name__)


@website.route("/")
def index():
    if appstate.running:
        return render_template("running.html")
    else:
        return render_template("index.html")


@website.route("/execute/", methods=["POST"])
def execute():
    if appstate.running:
        abort(400)
    appstate.running = True
    filename = save_to_temporary_file(request.form['sourcecode'])
    logging.debug("Wrote source code to file " + filename)

    appstate.process = subprocess.Popen("{} {}".format(sys.executable, filename), shell=True)

    return redirect(url_for(".index"))


def save_to_temporary_file(sourcecode):
    assert isinstance(sourcecode, unicode)
    filename = tempfile.mktemp(suffix=".py")
    with open(filename, "wb") as f:
        f.write(sourcecode.encode('utf8'))
    return filename


def createapp():
    app = Flask(__name__, static_folder='flask_static', template_folder='flask_templates')
    app.register_blueprint(website)
    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    app = createapp()
    app.debug = True
    app.run()