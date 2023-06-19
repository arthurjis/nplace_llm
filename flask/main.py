from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from model import Users, Chatbots, ChatSessions, ChatMessages, SessionUsers, SessionChatbots
from werkzeug.security import generate_password_hash, check_password_hash
from flask_limiter.util import get_remote_address
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_limiter import Limiter
from sqlalchemy import desc
from dotenv import load_dotenv
from flask_cors import CORS
from database import db

import simple_gpt_chatbot
import datetime
import logging
import os

def create_tables():
    with app.app_context():
        db.create_all()


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
create_tables()
current_time = datetime.datetime.now().time()
time_string = current_time.strftime("%Y-%m-%d %H:%M:%S")
limiter = Limiter(app=app, key_func=get_remote_address, storage_uri=os.getenv('REDIS_URI'))


@app.route('/')
def index():
    host = request.host
    return jsonify("Flask server running on host: {}    Starting at {}".format(host, time_string))

@app.route('/login', methods=['POST'])
@limiter.limit("5/minute")
def login():
    name = request.json.get('email', None)
    passcode = request.json.get('password', None)

    user = db.session.execute(db.select(Users).filter_by(name=name)).scalar_one_or_none()
    if not user or not check_password_hash(user.passcode, passcode):
        app.logger.error("Failed user login, username: {}".format(name))
        return jsonify({"msg": "Bad username or passcode"}), 401
    access_token = create_access_token(identity=name, expires_delta=datetime.timedelta(hours=48)) 
    user.last_login = datetime.datetime.utcnow()
    db.session.commit()
    app.logger.info("Successful user login, username: {}".format(name))
    return jsonify(access_token=access_token)

@app.route('/register', methods=['POST'])
@limiter.limit("5/minute")
def register():
    name = request.json.get('email', None)
    passcode = generate_password_hash(request.json.get('password', None))

    # Check if user already exists
    user = db.session.execute(db.select(Users).filter_by(name=name)).scalar_one_or_none()
    if user:
        app.logger.error("Failed user registration, user already exists, attempted username: {}".format(name))
        return jsonify({"msg": "User already exists"}), 400
    new_user = Users(name=name, passcode=passcode)
    db.session.add(new_user)
    db.session.commit()

    app.logger.info("Successful user registration, username: {}".format(name))
    return jsonify({"msg": "User created"}), 201

@socketio.on('start_chat')
def start_chat(data):
    token = request.args.get('token')
    try:
        decoded_token = decode_token(token)
        name = decoded_token['sub']
    except Exception as e:
        app.logger.error("Failed to start chat, failed to decode token")
        emit('error', {'error': 'Invalid token', 'code': 'INVALID_TOKEN'})
        return
    user = db.session.query(Users).filter_by(name=name).first()
    if not user:
        app.logger.error("Failed to start chat, failed to get user from db, username {}".format(name))
        emit('error', {'error': 'User not found', 'code': 'USER_NOT_FOUND'})  
        return 

    chat_session = ChatSessions()
    db.session.add(chat_session)
    db.session.commit()
    session_user = SessionUsers(user_name=user.name, chat_session_id=chat_session.id)
    db.session.add(session_user)

    # TODO: Only using one chatbot for everything now...
    chatbot = db.session.query(Chatbots).first()
    if not chatbot:
        chatbot = Chatbots(name="chatbot1")
        db.session.add(chatbot)
        db.session.commit()
        app.logger.debug("No chatbot found. New chatbot created and added to database.")
    session_chatbot = SessionChatbots(chatbot_name=chatbot.name, chat_session_id=chat_session.id)
    db.session.add(session_chatbot)
    db.session.commit()
    app.logger.info("Success in starting chat session {} for user {}".format(chat_session.id, user.name))
    emit('chat_session_started', {'chat_session_id': chat_session.id}, room=request.sid)
    return {'chat_session_id': chat_session.id}

@socketio.on('send_message')
def send_message(data):
    token = request.args.get('token')
    try:
        decoded_token = decode_token(token)
        name = decoded_token['sub']
    except Exception as e:
        app.logger.error("Failed to send message, failed to decode token")
        emit('error', {'error': 'Invalid token', 'code': 'INVALID_TOKEN'})
        return
    user = db.session.query(Users).filter_by(name=name).first()
    if not user:
        app.logger.error("Failed to send message, failed to get user from db, username {}".format(name))
        emit('error', {'error': 'User not found', 'code': 'USER_NOT_FOUND'})  
        return 
    
    chat_session_id = data['chat_session_id']
    message_text = data['text']

    chat_session = db.session.execute(db.select(ChatSessions).filter_by(id=chat_session_id)).scalar_one_or_none()
    if not chat_session or name not in [user.user_name for user in chat_session.users]:
        app.logger.error("Failed to send message, failed to get valid chat session from db, username {}, chat session ID {}".format(name, chat_session_id))
        emit('error', {'error': 'Chat session not found', 'code': 'CHAT_SESSION_NOT_FOUND'})  
        return 

    chat_session.last_opened = datetime.datetime.utcnow()
    user_message = ChatMessages(sender_id=user.id, sender_type='user', chat_session_id=chat_session.id, message=message_text)
    db.session.add(user_message)
    db.session.commit()

    # Fetch chat session history
    chat_session_history = simple_gpt_chatbot.get_chat_session_history(chat_session_id, N=8)

    # Select chatbot to respond
    # No group chat logic implemented. Just using the one chatbot in a session
    chatbot = chat_session.chatbots[0].chatbots

    # Generate chatbot's response
    response = simple_gpt_chatbot.generate_chatbot_response(chat_session_history)
    response_text = response['choices'][0]['message']['content']
    prompt_tokens = response['usage']['prompt_tokens']
    completion_tokens = response['usage']['completion_tokens']
    response_message = ChatMessages(sender_id=chatbot.id, sender_type='chatbot', chat_session_id=chat_session.id, message=response_text)
    db.session.add(response_message)
    chat_session.prompt_tokens += prompt_tokens
    chat_session.completion_tokens += completion_tokens
    db.session.commit()
    emit('new_message', {'chat_session_id': chat_session.id, 'text': response_text, 'username': chat_session.chatbots[0].chatbot_name, 'isLocal': False}, room=request.sid)

@app.route('/get_username', methods=['GET'])
@jwt_required()
@limiter.limit("30/minute")
def get_username():
    name = get_jwt_identity()
    if not name:
        app.logger.error("Failed to retrieve chat session, bad username: {}".format(name))
        return jsonify({"msg": "No chat sessions found"}), 404

    user = db.session.query(Users).filter_by(name=name).first()
    if not user:
        app.logger.error("Failed to retrieve chat session, user not found, username: {}".format(name))
        return jsonify({"msg": "No chat sessions found"}), 404  
    app.logger.debug("Success to retrieve username {}".format(user.name))
    return jsonify({"username": user.name})

@app.route('/chat_sessions', methods=['GET'])
@jwt_required()
@limiter.limit("30/minute")
def chat_sessions():
    name = get_jwt_identity()
    if not name:
        app.logger.error("Failed to retrieve chat session, bad username: {}".format(name))
        return jsonify({"msg": "No chat sessions found"}), 404

    user = db.session.query(Users).filter_by(name=name).first()
    if not user:
        app.logger.error("Failed to retrieve chat session, user not found, username: {}".format(name))
        return jsonify({"msg": "No chat sessions found"}), 404        

    # Fetch user's chat sessions and order them by last_opened
    chat_sessions = db.session.query(ChatSessions).\
        join(SessionUsers).\
        filter(SessionUsers.user_name == name).\
        filter(ChatSessions.status != 'deleted').\
        order_by(desc(ChatSessions.last_opened)).\
        all()

    # Extract chat session names, ids, and last_opened timestamps
    result = [{'id': cs.id, 'name': cs.name, 'last_opened': cs.last_opened} for cs in chat_sessions]
    app.logger.debug("Success to retrieve {} chat sessions, username {}".format(len(result), name))
    return jsonify({"chat_sessions": result})

@app.route('/chat_history/<int:session_id>', methods=['GET'])
@jwt_required()
@limiter.limit("30/minute")
def chat_history(session_id):
    username = get_jwt_identity()
    if not username:
        app.logger.error("Failed to retrieve chat history, bad username: {}".format(username))
        return jsonify({"msg": "No chat sessions found"}), 404

    chat_session = db.session.query(ChatSessions).filter_by(id=session_id).first()
    if not chat_session:
        app.logger.error("Failed to retrieve chat history for chat session {}, username: {}.Session not found".format(session_id, username))
        return jsonify({"msg": "Chat session not found"}), 404
    
    # Check for chat session status, if deleted return 403
    if chat_session.status == 'deleted':
        app.logger.error("Failed to retrieve chat history for chat session {}, username: {}. Session is deleted".format(session_id, username))
        return jsonify({"msg": "Chat session deleted"}), 403
    
    # Verify the requesting user is part of this chat session
    if username not in [user.user_name for user in chat_session.users]:
        app.logger.error("Failed to retrieve chat history for chat session {}, username: {}. User not part of this chat session".format(session_id, username))
        return jsonify({"msg": "Unauthorized"}), 403

    # Get the page number and size from query parameters, defaults to 1 and 50 respectively
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('size', default=50, type=int)
    query = db.session.query(ChatMessages).filter_by(chat_session_id=session_id).order_by(desc(ChatMessages.timestamp))
    pagination = query.paginate(page=page, per_page=page_size, error_out=False)
    # Get the items for the current page
    messages = pagination.items
    
    # Fetch unique sender_ids for users and chatbots separately
    user_sender_ids = list(set(msg.sender_id for msg in messages if msg.sender_type == "user"))
    chatbot_sender_ids = list(set(msg.sender_id for msg in messages if msg.sender_type == "chatbot"))

    # Fetch user and chatbot details in batch
    user_details = {user.id: user.name for user in Users.query.filter(Users.id.in_(user_sender_ids)).all()}
    chatbot_details = {chatbot.id: chatbot.name for chatbot in Chatbots.query.filter(Chatbots.id.in_(chatbot_sender_ids)).all()}

    messages_dict = [
        {
            "chat_session_id": chat_session.id,
            "text": msg.message,
            "username": user_details[msg.sender_id] if msg.sender_type == "user" else chatbot_details[msg.sender_id],
            "isLocal": msg.sender_type == "user"
        } for msg in messages
    ]

    app.logger.debug("Success to retrieve chat history for chat session {}, username: {}".format(session_id, username))
    return jsonify({"messages": messages_dict})

@app.route('/chat_sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("30/minute")
def delete_chat_session(session_id):
    username = get_jwt_identity()
    if not username:
        app.logger.error("Failed to delete chat session, bad username: {}".format(username))
        return jsonify({"msg": "No chat session found"}), 404

    chat_session = db.session.query(ChatSessions).filter_by(id=session_id).first()
    if not chat_session:
        app.logger.error("Failed to delete chat session {}, username: {}".format(session_id, username))
        return jsonify({"msg": "Chat session not found"}), 404
    
    # Verify the requesting user is part of this chat session
    if username not in [user.user_name for user in chat_session.users]:
        app.logger.error("Failed to delete chat session {}, username: {}. User not part of this chat session".format(session_id, username))
        return jsonify({"msg": "Unauthorized"}), 403

    # Soft delete the chat session by changing its status
    chat_session.status = 'deleted'
    db.session.commit()

    app.logger.debug("Successfully deleted chat session {}, username: {}".format(session_id, username))
    return jsonify({"msg": "Chat session deleted successfully"}), 200


if __name__ == '__main__':
    socketio.run(app, debug=True, port=os.getenv("PORT", default=5000))
