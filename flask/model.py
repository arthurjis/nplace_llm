from datetime import datetime
from database import db


class Users(db.Model):
    """
    Users table in the database. Each instance represents a user.
    
    Columns:
    id: A unique string that identifies a user.
    passcode: A string that represents the user's passcode.
    chat_sessions: A list of chat sessions that the user is part of.
    """
    __tablename__ = 'users'

    id = db.Column(db.String(255), primary_key=True)
    passcode = db.Column(db.String(255), nullable=False)
    chat_sessions = db.relationship('ChatSessions', secondary='session_users', backref='users')


class ChatSessions(db.Model):
    """
    ChatSessions table in the database. Each instance represents a chat session.
    
    Columns:
    id: A unique integer that identifies a chat session.
    users: A list of users that are part of this chat session.
    chatbots: A list of chatbots that are part of this chat session.
    messages: A list of messages that belong to this chat session.
    """
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    users = db.relationship('Users', secondary='session_users', backref='chat_sessions')
    chatbots = db.relationship('Chatbots', secondary='session_chatbots', backref='chat_sessions')
    messages = db.relationship('ChatMessages', backref='chat_session', lazy=True)


class ChatMessages(db.Model):
    """
    ChatMessages table in the database. Each instance represents a chat message.
    
    Columns:
    id: A unique integer that identifies a message.
    sender_id: A string that represents the id of the sender.
    sender_type: A string that represents the type of the sender ('user' or 'chatbot').
    chat_session_id: An integer that represents the id of the chat session the message belongs to.
    message: A string that contains the content of the message.
    timestamp: A datetime object that represents when the message was sent.
    """
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.String(255), nullable=False)
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

    id = db
