import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';


function Chat({ selectedChatSession, setSelectedChatSession }) {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (selectedChatSession) {
      // Clear current messages
      setMessages([]);

      // Load chat history from the server
      fetch(process.env.REACT_APP_SERVER_URL + '/chat_history/' + selectedChatSession, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => response.json())
        .then(data => {
          setMessages(data.messages);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [selectedChatSession]);

  useEffect(() => {
    // Listen for new messages from the server
    socket.on('new_message', (message) => {
      console.debug("Received message: " + JSON.stringify(message));
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for 'chat_session_started' from the server
    socket.on('chat_session_started', (data) => {
      setSelectedChatSession(data.chat_session_id);
      console.log('Chat session started with id: ' + data.chat_session_id);
    });

    return () => {
      // Clean up the listener when the component is unmounted
      socket.off('new_message');
      socket.off('chat_session_started');
    };
  }, [socket]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
  }, [messages]);

  function handleSendMessage(messageText) {
    // If there is no chat session selected, emit 'start_chat' to the server to create a new chat session
    // The server should respond with a 'chat_session_started' event, which we will handle elsewhere
    if (!selectedChatSession) {
      console.debug('No chat session selected, starting a new chat session...');
      socket.emit('start_chat');
    }
  
    // Wait until we have a chat session ID before we try to send a message
    // This ensures we don't try to send a message to an undefined chat session
    if (selectedChatSession) {
      // Add the user's message to the chat
      const userMessage = {
        chat_session_id: selectedChatSession,
        text: messageText,
        username: 'You',
        isLocal: true,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
  
      // Emit the user's message to the server
      socket.emit('send_message', userMessage);
      console.debug('Sent message: ', userMessage);
    }
  }
  

 return (
   <div className="chat">
     <div className="chat-messages" ref={messagesRef}>
       {messages.map((message, index) => (
         <Message key={index} message={message} isLocal={message.isLocal} />
       ))}
     </div>
     <Input className="chat-input" onSendMessage={handleSendMessage} />
   </div>
 );
}

export default Chat;
