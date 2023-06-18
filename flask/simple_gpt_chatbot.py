import openai
import os

from sqlalchemy import text
from database import db

openai.api_key = os.getenv("OPENAI_API_KEY")


def get_chat_session_history(chat_session_id, N=8):
    """
    Retrieves the history of a chat session given its ID.

    Args:
        chat_session_id (int): The ID of the chat session.

    Returns:
        list[dict]: A list of dictionaries where each dictionary represents a message and contains the keys 'role' and 'content'.
    """
    result = db.session.execute(
        text("""
            SELECT sender_type AS role, message AS content 
            FROM chat_messages
            WHERE chat_session_id = :chat_session_id
            ORDER BY timestamp DESC
            LIMIT :N
        """), 
        {'chat_session_id': chat_session_id, 'N': N}
    )
    # Reverse the result to maintain the chronological order
    chat_session_history = [{"role": "assistant" if row.role == 'chatbot' else row.role, "content": row.content} for row in reversed(list(result))]
    return chat_session_history


def generate_chatbot_response(chat_session_history):
    """
    Generates a chatbot response given a history of chat messages.

    Args:
        chat_session_history (list[dict]): A list of dictionaries where each dictionary represents a message and contains the keys 'role' and 'content'.

    Returns:
        str: The chatbot's response, or a default response if an error occurs.
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                *chat_session_history,
            ],
            max_tokens=1024,
            temperature=1,
        )
        if 'choices' in response and len(response['choices']) > 0 and 'message' in response['choices'][0] and 'content' in response['choices'][0]['message']:
            return response['choices'][0]['message']['content']
        else:
            print("Bad response from OpenAI API")
            return "I'm sorry, I couldn't generate a response. Please try again."
    except Exception as e:
        print(f"Exception Type: {type(e).__name__} Error while calling OpenAI API: {e}")
        return "I'm sorry, I'm currently experiencing difficulties. Please try again later."

