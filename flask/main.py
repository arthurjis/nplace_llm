from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from sqlalchemy import desc, asc
from dotenv import load_dotenv
from datetime import datetime
from functools import wraps
from database import db

from model import Users, Chatbots, ChatSessions, ChatMessages, SessionUsers, SessionChatbots

import simple_gpt_chatbot
import logging
import os


def jwt_required_wraps(func):
    @wraps(func)
    @jwt_required()
    def wrapped(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapped


load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

app.logger.setLevel(logging.DEBUG)

allowed_origins = os.getenv('ALLOWED_ORIGINS').split(',')
socketio = SocketIO(app, cors_allowed_origins=allowed_origins, async_mode='gevent', logger=True, engineio_logger=True)
CORS(app, origins=allowed_origins)
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
    id = request.json.get('email', None)
    passcode = request.json.get('password', None)
    app.logger.debug("Received POST to login user: {}".format(id))

    user = db.session.execute(db.select(Users).filter_by(id=id)).scalar_one_or_none()

    if not user or not check_password_hash(user.passcode, passcode):
        return jsonify({"msg": "Bad id or passcode"}), 401

    access_token = create_access_token(identity=id)
    return jsonify(access_token=access_token)

@app.route('/register', methods=['POST'])
def register():
    id = request.json.get('email', None)
    passcode = generate_password_hash(request.json.get('password', None))
    app.logger.debug("Received POST to register user: {}".format(id))

    # Check if user already exists
    user = db.session.execute(db.select(Users).filter_by(id=id)).scalar_one_or_none()

    if user:
        return jsonify({"msg": "User already exists"}), 400

    new_user = Users(id=id, passcode=passcode)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created"}), 201

@socketio.on('start_chat')
def start_chat(data):
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
    return {'chat_session_id': chat_session.id}

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

    chat_session.last_opened = datetime.utcnow()
    user_message = ChatMessages(sender_id=user_id, sender_type='user', chat_session_id=chat_session.id, message=message_text)
    db.session.add(user_message)
    db.session.commit()

    # Fetch chat session history
    chat_session_history = simple_gpt_chatbot.get_chat_session_history(chat_session_id)

    # Generate chatbot's response
    response = simple_gpt_chatbot.generate_chatbot_response(chat_session_history)
    response_message = ChatMessages(sender_id=chat_session.chatbots[0].chatbot_id, sender_type='chatbot', chat_session_id=chat_session.id, message=response)
    db.session.add(response_message)
    db.session.commit()
    emit('new_message', {'chat_session_id': chat_session.id, 'text': response, 'username': chat_session.chatbots[0].chatbots.name, 'isLocal': False}, room=request.sid)

@app.route('/chat_sessions', methods=['GET'])
@jwt_required_wraps  # Change this line
def chat_sessions():
    user_id = get_jwt_identity()
    if user_id:
        user = db.session.get(Users, user_id)
        if user:
            # Fetch user's chat sessions and order them by last_opened
            chat_sessions = db.session.query(ChatSessions).\
                join(SessionUsers).\
                filter(SessionUsers.user_id == user_id).\
                order_by(desc(ChatSessions.last_opened)).\
                all()

            # Extract chat session names, ids, and last_opened timestamps
            result = [{'id': cs.id, 'name': cs.name, 'last_opened': cs.last_opened} for cs in chat_sessions]
            app.logger.debug("Retrieved {} chat sessions from user {}".format(len(result), user_id))
            return jsonify({"chat_sessions": result})

    return jsonify({"msg": "No chat sessions found"}), 404

@app.route('/chat_history/<int:session_id>', methods=['GET'])
@jwt_required_wraps
def chat_history(session_id):
    # Get the user's identity from the JWT
    user_id = get_jwt_identity()

    # Get the chat session from the database
    chat_session = db.session.query(ChatSessions).filter_by(id=session_id).first()

    if not chat_session:
        return jsonify({"msg": "Chat session not found"}), 404

    # Verify the requesting user is part of this chat session
    if user_id not in [user.user_id for user in chat_session.users]:
        return jsonify({"msg": "Unauthorized"}), 403

    # Get the chat history for this chat session
    messages = db.session.query(ChatMessages).filter_by(chat_session_id=session_id).order_by(asc(ChatMessages.timestamp)).all()

    # Convert each message to a dictionary format for JSON response
    messages_dict = [{"chat_session_id": chat_session.id, "text": msg.message, "username": msg.sender_id, "isLocal": msg.sender_type == "user"} for msg in messages];
    print(messages_dict)

    return jsonify({"messages": messages_dict})



if __name__ == '__main__':
    socketio.run(app, debug=True, port=os.getenv("PORT", default=5000))
