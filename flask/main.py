from flask_jwt_extended import create_access_token
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from datetime import datetime

import logging
import os

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'    #TODO set secret key
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)  # Enable CORS for the Flask app

current_time = datetime.now().time()
time_string = current_time.strftime("%Y-%m-%d %H:%M:%S")

@app.route('/')
def index():
    host = request.host
    return jsonify("Flask server running on host: {}    Starting at {}".format(host, time_string))


@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json['message']
    app.logger.debug(f"Received user message: {user_message}")

    # responses = simple_chatbot.reply(user_message)
    responses = "hi there"
    app.logger.debug(f"Generated responses: {responses}")

    return jsonify(responses)

@app.route('/login', methods=['POST'])
def login():
    id = request.json.get('id', None)
    password = request.json.get('password', None)
    # Validate the credentials here (you'll replace this with code to check your database)
    if id != 'test' or password != 'test':
        return jsonify({"msg": "Bad id or password"}), 401

    access_token = create_access_token(identity=id)
    return jsonify(access_token=access_token)


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
