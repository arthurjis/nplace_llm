from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from dotenv import load_dotenv
from datetime import datetime
from database import db

from model import Users, Chatbots, ChatSessions, ChatMessages, SessionUsers, SessionChatbots

import simple_gpt_chatbot
import logging
import os


load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'    #TODO set secret key
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

app.logger.setLevel(logging.DEBUG)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent', logger=True, engineio_logger=True)
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

    user = db.session.execute(db.select(Users).filter_by(id=id)).scalar_one_or_none()

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
    user = db.session.execute(db.select(Users).filter_by(id=id)).scalar_one_or_none()

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
    user = db.session.get(Users, user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 400

    chat_session = ChatSessions()
    db.session.add(chat_session)
    db.session.commit()

    session_user = SessionUsers(user_id=user.id, chat_session_id=chat_session.id)
    db.session.add(session_user)

    chatbot = db.session.query(Chatbots).first()
    if not chatbot:
        chatbot = Chatbots(name="chatbot1")
        db.session.add(chatbot)
        db.session.commit()
        app.logger.debug("No chatbot found. New chatbot created and added to database.")
    session_chatbot = SessionChatbots(chatbot_id=chatbot.id, chat_session_id=chat_session.id)
    db.session.add(session_chatbot)
    db.session.commit()
    emit('chat_session_started', {'chat_session_id': chat_session.id}, room=request.sid)
    app.logger.debug("Starting chat session {} for room {}".format(chat_session.id, request.sid))

@socketio.on('send_message')
def send_message(data):
    token = request.args.get('token')
    try:
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
    except Exception as e:
        emit('error', {'error': 'Invalid token'})
        return
    user = db.session.get(Users, user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 400

    chat_session_id = data['chat_session_id']
    message_text = data['text']

    chat_session = db.session.execute(db.select(ChatSessions).filter_by(id=chat_session_id)).scalar_one_or_none()
    if not chat_session or user_id not in [user.user_id for user in chat_session.users]:
        return jsonify({"msg": "Chat session not found"}), 400

    user_message = ChatMessages(sender_id=user_id, sender_type='user', chat_session_id=chat_session.id, message=message_text)
    db.session.add(user_message)
    db.session.commit()

    # Fetch chat session history
    chat_session_history = simple_gpt_chatbot.get_chat_session_history(chat_session_id)

    # Generate chatbot's response
    response = simple_gpt_chatbot.generate_chatbot_response(chat_session_history)


    # Here we're simulating a chatbot response for the sake of simplicity
    # response = "Hello, there!"
    response_message = ChatMessages(sender_id=chat_session.chatbots[0].chatbot_id, sender_type='chatbot', chat_session_id=chat_session.id, message=response)
    db.session.add(response_message)
    db.session.commit()
    emit('new_message', {'chat_session_id': chat_session.id, 'text': response, 'username': chat_session.chatbots[0].chatbots.name, 'isLocal': False}, room=request.sid)
  
    # Emit the new_message event for the user's message
    # emit('new_message', {'sender_id': user_id, 'content': message_text, 'role': 'user'}, room=request.sid)

    # Emit the new_message event for the chatbot's message
    # emit('new_message', {'sender_id': 'chatbot1', 'content': response, 'role': 'assistant'}, room=request.sid)
   


if __name__ == '__main__':
    socketio.run(app, debug=True, port=os.getenv("PORT", default=5000))

