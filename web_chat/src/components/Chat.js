import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';


function Chat() {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    // Emit 'start_chat' when the component mounts
    socket.emit('start_chat');

    // Listen for new messages from the server
    socket.on('new_message', (message) => {
      console.log("Received new message: " + message['message_text'])
      const botMessage = {
        text: message['message_text'],
        username: 'Chatbot',
        isLocal: false,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    });

    // Listen for 'chat_session_started' from the server
    socket.on('chat_session_started', (data) => {
      setChatSessionId(data.chat_session_id);
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
  // Add the user's message to the chat
  const userMessage = {
    text: messageText,
    username: 'You',
    isLocal: true,
  };
  setMessages((prevMessages) => [...prevMessages, userMessage]);

  // Emit the user's message to the server
  const msg = {
    chat_session_id: chatSessionId,
    message_text: messageText
  };
  socket.emit('send_message', msg);
  console.log('Message sent: ', msg)
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
