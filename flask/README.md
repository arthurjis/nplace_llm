# Chatbot Website Server and Database

This application is a Flask-based server with JWT-based authentication, a PostgreSQL database, and a SocketIO integration for real-time communication.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Database](#database)
- [Server](#server)
- [Endpoints](#endpoints)
- [SocketIO Events](#socketio-events)

## Installation

Please refer to the `requirements.txt` file for a list of Python dependencies to be installed.

## Configuration

The server's configuration settings can be modified in the `main.py` file. It includes a JWT secret key and a SQLAlchemy database URI that is fetched from an environment variable.

## Database

The database used is PostgreSQL and is managed using SQLAlchemy. It consists of five tables:

1. **Users**: Stores user id and passcode.
2. **ChatSessions**: Each row represents a chat session. A chat session is associated with multiple users and chatbots, and contains multiple chat messages.
3. **ChatMessages**: Stores information about chat messages, including the sender's id and type ('user' or 'chatbot'), the associated chat session id, the content of the message, and the timestamp.
4. **Chatbots**: Stores chatbot id and name.
5. **SessionUsers**: A junction table that represents the many-to-many relationship between users and chat sessions.
6. **SessionChatbots**: A junction table that represents the many-to-many relationship between chatbots and chat sessions.

## Server

The server is set up in `main.py`, which also includes the configuration settings, JWT setup, SocketIO setup, and CORS setup.

## Endpoints

The server has the following endpoints:

1. `/`: The index route returns a simple message to confirm that the server is running.
2. `/login`: This endpoint accepts POST requests with a JSON body containing 'id' and 'passcode' fields. It checks if a user with the given id and passcode exists in the database and returns a JWT access token if successful.
3. `/register`: This endpoint accepts POST requests with a JSON body containing 'id' and 'passcode' fields. It checks if a user with the given id already exists in the database, and if not, it creates a new user.

## SocketIO Events

The server handles the following SocketIO events:

1. `start_chat`: This event starts a chat session for the user associated with the provided JWT token. It creates a new chat session, adds the user to the session, and assigns a chatbot to the session.
2. `send_message`: This event handles messages sent by a user. It checks if the user and chat session exist, then saves the user's message in the database, and returns a chatbot response.

