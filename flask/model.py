from datetime import datetime
from database import db


class SessionUsers(db.Model):
    __tablename__ = 'session_users'
    user_name = db.Column(db.String(255), db.ForeignKey('users.name'), primary_key=True)
    chat_session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), primary_key=True)

    users = db.relationship('Users', back_populates='chat_sessions')
    chat_sessions = db.relationship('ChatSessions', back_populates='users')


class SessionChatbots(db.Model):
    __tablename__ = 'session_chatbots'
    chatbot_name = db.Column(db.String(255), db.ForeignKey('chatbots.name'), primary_key=True)
    chat_session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), primary_key=True)

    chatbots = db.relationship('Chatbots', back_populates='chat_sessions')
    chat_sessions = db.relationship('ChatSessions', back_populates='chatbots')


class Users(db.Model):
    """
    Users table in the database. Each instance represents a user.
    
    Columns:
    id: A unique integer that identifies a user.
    name: A unique string that represents the user's name.
    passcode: A string that represents the user's passcode.
    chat_sessions: A list of chat sessions that the user is part of.
    created_at: The date and time when the account was created.
    last_login: The last date and time the user logged in.
    status: The status of the account, options include active, disabled, or deleted.
    role: The role of the user, default is 'user'.
    phone_number: The user's phone number, default is empty.
    email: A string that represents the user's email address.
    dob: The user's date of birth, default is empty.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    passcode = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    status = db.Column(db.String(255), nullable=False, default='active')
    role = db.Column(db.String(255), nullable=False, default='user')
    phone_number = db.Column(db.String(255), default='')
    email = db.Column(db.String(255), default='')
    dob = db.Column(db.Date)
    chat_sessions = db.relationship('SessionUsers', back_populates='users')


class ChatSessions(db.Model):
    """
    ChatSessions table in the database. Each instance represents a chat session.
    
    Columns:
    id: A unique integer that identifies a chat session.
    name: A string for chat session name.
    last_opened: A datetime for last opened time
    created_at: A datetime for creation time
    session_type: A integer for session type
    prompt_tokens: Total prompt tokens in this session
    completion_tokens: Total completion tokens in this session
    status: The status of the chat session, options include active or deleted.
    users: A list of users that are part of this chat session.
    chatbots: A list of chatbots that are part of this chat session.
    messages: A list of messages that belong to this chat session.
    """
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
    last_opened = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    session_type = db.Column(db.Integer, nullable=False, default=0)
    prompt_tokens = db.Column(db.Integer, nullable=False, default=0)
    completion_tokens = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(255), nullable=False, default='active')
    users = db.relationship('SessionUsers', back_populates='chat_sessions')
    chatbots = db.relationship('SessionChatbots', back_populates='chat_sessions')
    messages = db.relationship('ChatMessages', backref='chat_session', lazy=True)


class ChatMessages(db.Model):
    """
    ChatMessages table in the database. Each instance represents a chat message.
    
    Columns:
    id: A unique integer that identifies a message.
    sender_id: An integer that represents the id of the sender.
    sender_type: A string that represents the type of the sender ('user' or 'chatbot').
    chat_session_id: An integer that represents the id of the chat session the message belongs to.
    message: A string that contains the content of the message.
    timestamp: A datetime object that represents when the message was sent.
    """
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, nullable=False)
    sender_type = db.Column(db.String, nullable=False)
    chat_session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False)
    message = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class Chatbots(db.Model):
    """
    Chatbots table in the database. Each instance represents a chatbot.
    
    Columns:
    id: A unique integer that identifies a chatbot.
    name: A string that represents the name of the chatbot.
    chat_sessions: A list of chat sessions that the chatbot is part of.
    """
    __tablename__ = 'chatbots'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    chat_sessions = db.relationship('SessionChatbots', back_populates='chatbots')
