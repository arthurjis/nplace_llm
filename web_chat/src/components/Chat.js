import React, { useState, useEffect, useContext } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';
import { sendMessageToChatbot } from '../services/chatbot';

function Chat() {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);

 useEffect(() => {
   // Listen for new messages from the server
   socket.on('newMessage', (message) => {
     setMessages((prevMessages) => [...prevMessages, message]);
   });

   return () => {
     // Clean up the listener when the component is unmounted
     socket.off('newMessage');
   };
 }, [socket]);

 const handleSendMessage = async (messageText) => {
   // Send the message to the server
   const message = {
     text: messageText,
     username: 'You',
     profilePhoto: 'https://example.com/your-photo.jpg', // Replace with your photo URL
     isLocal: true,
   };
   setMessages((prevMessages) => [...prevMessages, message]);
   socket.emit('sendMessage', message);

   // Send the message to the chatbot and display the response
   const chatbotResponse = await sendMessageToChatbot(messageText);
   if (chatbotResponse) {
     const chatbotMessage = {
       text: chatbotResponse,
       username: 'Chatbot',
       profilePhoto: 'https://example.com/chatbot-photo.jpg', // Replace with chatbot photo URL
       isLocal: false,
     };
     setMessages((prevMessages) => [...prevMessages, chatbotMessage]);
     socket.emit('sendMessage', chatbotMessage);
   }
 };

 return (
   <div className="chat">
     {messages.map((message, index) => (
       <Message key={index} message={message} isLocal={message.isLocal} />
     ))}
     <Input onSendMessage={handleSendMessage} />
   </div>
 );
}

export default Chat;

