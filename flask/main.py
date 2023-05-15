from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from dotenv import load_dotenv
from datetime import datetime
from database import db

from model import Users, Chatbots, ChatSessions, ChatMessages

import logging
import os


load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'    #TODO set secret key
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

app.logger.setLevel(logging.DEBUG)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

def create_tables():
    with app.app_context():
        db.create_all()

create_tables()
current_time = datetime.now().time()
time_string = current_time.strftime("%Y-%m-%d %H:%M:%S")

@app.route('/')
def index():
    host = request.host
    return jsonify("Flask server running on host: {}    Starting at {}".format(host, time_string))

@app.route('/login', methods=['POST'])
def login():
    id = request.json.get('id', None)
    passcode = request.json.get('passcode', None)
    app.logger.debug("Received POST to login user: {} with passcode: {}".format(id, passcode))

    user = Users.query.filter_by(id=id).first()

    if not user or user.passcode != passcode:
        return jsonify({"msg": "Bad id or passcode"}), 401

    access_token = create_access_token(identity=id)
    return jsonify(access_token=access_token)

@app.route('/register', methods=['POST'])
def register():
    id = request.json.get('id', None)
    passcode = request.json.get('passcode', None)
    app.logger.debug("Received POST to register user: {} with passcode: {}".format(id, passcode))

    # Check if user already exists
    user = Users.query.filter_by(id=id).first()

    if user:
        return jsonify({"msg": "User already exists"}), 400

    new_user = Users(id=id, passcode=passcode)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created"}), 201

@socketio.on('start_chat')
def start_chat():
    token = request.args.get('token')

    try:
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']

    except Exception as e:
        emit('error', {'error': 'Invalid token'})
        return
    user = Users.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 400

    chat_session = ChatSessions()
    chat_session.users.append(user)

    chatbot = Chatbots.query.first()
    if not chatbot:
        return jsonify({"msg": "Chatbot not found"}), 406
    chat_session.chatbots.append(chatbot)

    db.session.add(chat_session)
    db.session.commit()

    app.logger.debug("aaaa     chat session started.")


    emit('chat_session_started', {'chat_session_id': chat_session.id}, room=request.sid)

@socketio.on('send_message')
@jwt_required()
def send_message(data):
    user_id = get_jwt_identity()
    chat_session_id = data['chat_session_id']
    message_text = data['message_text']

    chat_session = ChatSessions.query.get(chat_session_id)
    if not chat_session or user_id not in [user.id for user in chat_session.users]:
        return jsonify({"msg": "Chat session not found"}), 400

    new_message = ChatMessages(chat_session_id=chat_session_id, sender_id=user_id, content=message_text, role='user')
    db.session.add(new_message)
    db.session.commit()

    # Here we're simulating a chatbot response for the sake of simplicity
    chatbot_response = "Hello, there!"
    chatbot_message = ChatMessages(chat_session_id=chat_session_id, sender_id='chatbot1', content=chatbot_response, role='assistant')
    db.session.add(chatbot_message)
    db.session.commit()

    # Emit the new_message event for the user's message
    emit('new_message', {'sender_id': user_id, 'content': message_text, 'role': 'user'}, room=request.sid)

    # Emit the new_message event for the chatbot's message
    emit('new_message', {'sender_id': 'chatbot1', 'content': chatbot_response, 'role': 'assistant'}, room=request.sid)

@socketio.on('get_chat_history')
@jwt_required()
def get_chat_history(data):
    user_id = get_jwt_identity()
    chat_session_id = data['chat_session_id']

    chat_session = ChatSessions.query.get(chat_session_id)
    if not chat_session or user_id not in [user.id for user in chat_session.users]:
        return jsonify({"msg": "Chat session not found"}), 400

    messages = chat_session.messages.order_by(ChatMessages.timestamp.asc()).all()
    formatted_messages = [{"sender_id": message.sender_id, "content": message.content, "role": message.role, "timestamp": message.timestamp.isoformat()} for message in messages]

    emit('chat_history', {'messages': formatted_messages}, room=request.sid)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=os.getenv("PORT", default=5000))

