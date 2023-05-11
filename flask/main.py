from flask_jwt_extended import JWTManager, create_access_token
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_pymongo import PyMongo
from flask_cors import CORS

from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
from datetime import datetime

import logging
import os


load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'    #TODO set secret key
app.config["MONGO_URI"] = os.environ.get('MONGO_URL')
mongo = PyMongo(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)  # Enable CORS for the Flask app
jwt = JWTManager(app)  # add this line

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
    passcode = request.json.get('passcode', None)
    # Validate the credentials here (you'll replace this with code to check your database)
    if id != 'test' or passcode != 'test':
        return jsonify({"msg": "Bad id or passcode"}), 401

    access_token = create_access_token(identity=id)
    return jsonify(access_token=access_token)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('id') or not data.get('passcode'):
        return jsonify({'error': 'Must provide user ID and passcode'}), 400

    user_id = data['id']
    passcode = data['passcode']

    hashed_passcode = generate_password_hash(passcode)

    users = mongo.db.users
    if users.find_one({'_id': user_id}):
        return jsonify({'error': 'User ID already exists'}), 400

    users.insert({'_id': user_id, 'passcode': hashed_passcode})

    return jsonify({'message': 'Registered successfully'}), 201


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
