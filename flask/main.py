from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

import logging
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)  # Enable CORS for the Flask app


@app.route('/')
def index():
    port = os.getenv("PORT", default=5000)
    host = request.host
    return jsonify({"Choo Choo": "Welcome to your Flask app 🚅  " + str(port) + "   " + str(host)})

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json['message']
    app.logger.debug(f"Received user message: {user_message}")

    # responses = simple_chatbot.reply(user_message)
    responses = "hi there"
    app.logger.debug(f"Generated responses: {responses}")

    return jsonify(responses)


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
