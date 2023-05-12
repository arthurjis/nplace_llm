from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
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
# app.config['SQLALCHEMY_ECHO'] = True

app.logger.setLevel(logging.DEBUG)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

def create_tables():
    with app.app_context():
        db.create_all()

app.logger.debug("Begin creating tables")
create_tables()
app.logger.debug("Done creating tables")

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

@app.route('/start_chat', methods=['POST'])
@jwt_required()
def start_chat():
    user_id = get_jwt_identity()

    # Get the user from the database
    user = Users.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 400

    # Create a new chat session
    chat_session = ChatSessions()
    chat_session.users.append(user)

    # Add a default chatbot to the session
    chatbot = Chatbots.query.first()
    if not chatbot:
        return jsonify({'msg': 'Chatbot not found'}), 400
    chat_session.chatbots.append(chatbot)

    # Commit the changes to the database
    db.session.add(chat_session)
    db.session.commit()

    return jsonify({'msg': 'Chat session started', 'chat_session_id': chat_session.id})

@app.route('/send_message', methods=['POST'])
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    chat_session_id = request.json['chat_session_id']
    message_content = request.json['message_content']
    
    # Find the chat session
    chat_session = ChatSessions.query.get(chat_session_id)

    # Check if the chat session exists and the user is part of it
    if not chat_session or user_id not in [user.id for user in chat_session.users]:
        return jsonify({"error": "Invalid chat session"}), 400
    
    # Add the user's message to the database
    new_message = ChatMessages(chat_session_id=chat_session_id, sender_id=user_id, content=message_content, role='user')
    db.session.add(new_message)
    db.session.commit()

    # Generate a response using OpenAI's API
    # messages_for_api = [{"role": message.role, "content": message.content} for message in chat_session.messages.order_by(ChatMessages.timestamp.asc()).all()]
    # chatbot_responses = generate_chatbot_responses(messages_for_api)
    chatbot_responses = "hi there"

    # Save chatbot's responses to the database
    for response in chatbot_responses:
        chatbot_message = ChatMessages(chat_session_id=chat_session_id, sender_id=response['sender_id'], content=response['content'], role='assistant')
        db.session.add(chatbot_message)
    db.session.commit()

    return jsonify({"success": True, "chatbot_responses": chatbot_responses})

@app.route('/get_chat_history', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = get_jwt_identity()
    chat_session_id = request.args.get('chat_session_id')

    # Find the chat session
    chat_session = ChatSessions.query.get(chat_session_id)

    # Check if the chat session exists and the user is part of it
    if not chat_session or user_id not in [user.id for user in chat_session.users]:
        return jsonify({"error": "Invalid chat session"}), 400

    # Fetch and sort chat messages
    messages = chat_session.messages.order_by(ChatMessages.timestamp.asc()).all()

    # Format messages for response
    formatted_messages = [{"sender_id": message.sender_id, "content": message.content, "role": message.role, "timestamp": message.timestamp.isoformat()} for message in messages]

    return jsonify({"success": True, "messages": formatted_messages})



# @app.route('/send_message', methods=['POST'])
# @jwt_required()
# def send_message():
#     user_message = request.json['message']
#     app.logger.debug(f"Received user message: {user_message}")

#     # Save message to database
#     user_id = get_jwt_identity()
#     new_message = ChatMessages(user_id=user_id, message=user_message)
#     db.session.add(new_message)
#     db.session.commit()

#     # Fake a response for the sake of the example
#     responses = "hi there"
#     app.logger.debug(f"Generated responses: {responses}")

#     return jsonify(responses)


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
