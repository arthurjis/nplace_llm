import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';

function Chat() {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    // Emit 'start_chat' when the component mounts
    socket.emit('start_chat');

    // Listen for new messages from the server
    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for 'chat_session_started' from the server
    socket.on('chat_session_started', (data) => {
      console.log('Chat session started with id: ' + data.chat_session_id);
    });

    return () => {
      // Clean up the listener when the component is unmounted
      socket.off('newMessage');
      socket.off('chat_session_started');
    };
  }, [socket]);

 useEffect(() => {
  if (messagesRef.current) {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

 function handleSendMessage(messageText) {
  // Add the user's message to the chat
  const userMessage = {
    text: messageText,
    username: 'You',
    // role: 'user',
    isLocal: true,
  };
  setMessages((prevMessages) => [...prevMessages, userMessage]);

  // Emit the user's message to the server
  socket.emit('message', messageText);
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
