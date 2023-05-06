import sys
from pathlib import Path

web_chat_dir = str(Path(__file__).resolve().parent.parent.parent)
if web_chat_dir not in sys.path:
    sys.path.insert(0, web_chat_dir)

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import logging
from flask_cors import CORS
from scripts.simple_chatbot import SimpleChatbot


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)  # Enable CORS for the Flask app

# Configure logging settings for the Flask app
app.logger.setLevel(logging.DEBUG)
simple_chatbot = SimpleChatbot()

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json['message']
    # app.logger.debug(f"Received user message: {user_message}")

    responses = simple_chatbot.reply(user_message)
    # app.logger.debug(f"Generated responses: {responses}")

    return jsonify(responses)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
