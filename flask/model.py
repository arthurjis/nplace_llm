# models.py

from datetime import datetime
from database import db


class User(db.Model):
    id = db.Column(db.String(255), primary_key=True)
    passcode = db.Column(db.String(255), nullable=False)
    chat_sessions = db.relationship('ChatMessage', backref='user', lazy=True)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
