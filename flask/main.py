from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_pymongo import PyMongo
from flask_cors import CORS

from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime

import logging
import openai
import os


load_dotenv()

app = Flask(__name__)


# print("aaaaaaaaa       " + os.environ.get('MONGO_URL'))
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
    data = request.get_json()

    if not data or not data.get('id') or not data.get('passcode'):
        return jsonify({'error': 'Must provide user ID and passcode'}), 400

    user_id = data['id']
    passcode = data['passcode']

    users = mongo.db.users_db
    user = users.find_one({'_id': user_id})

    if not user or not check_password_hash(user['passcode'], passcode):
        return jsonify({'error': 'Invalid user ID or passcode'}), 401

    access_token = create_access_token(identity=user_id)

    return jsonify({'access_token': access_token}), 200

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

@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    message = request.get_json().get('message')

    if not message:
        return jsonify({'error': 'Must provide a message'}), 400

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=message,
        max_tokens=150,
    )

    return jsonify({'response': response.choices[0].text.strip()}), 200


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
