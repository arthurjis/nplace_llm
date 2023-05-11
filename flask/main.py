from flask import Flask, jsonify, request
import os

app = Flask(__name__)


@app.route('/')
def index():
    port = os.getenv("PORT", default=5000)
    host = request.host
    return jsonify({"Choo Choo": "Welcome to your Flask app 🚅  " + str(port) + "   " + str(host)})


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
