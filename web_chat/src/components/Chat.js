import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';
import { sendMessageToChatbot } from '../services/chatbot';

function Chat() {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

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

 useEffect(() => {
  if (messagesRef.current) {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

//  const handleSendMessage_old = async (messageText) => {
//    // Send the message to the server
//    const message = {
//      text: messageText,
//      username: 'You',
//      profilePhoto: 'https://example.com/your-photo.jpg', // Replace with your photo URL
//      isLocal: true,
//    };
//    setMessages((prevMessages) => [...prevMessages, message]);
//    socket.emit('sendMessage', message);

//    // Send the message to the chatbot and display the response
//    const chatbotResponse = await sendMessageToChatbot(messageText);
//    if (chatbotResponse) {
//      const chatbotMessage = {
//        text: chatbotResponse,
//        username: 'Chatbot',
//        profilePhoto: 'https://example.com/chatbot-photo.jpg', // Replace with chatbot photo URL
//        isLocal: false,
//      };
//      setMessages((prevMessages) => [...prevMessages, chatbotMessage]);
//      socket.emit('sendMessage', chatbotMessage);
   
//   // Hardcoded chatbot response
//   const chatbotResponse = 'This is a hardcoded response from the chatbot.';

//   const chatbotMessage = {
//     text: chatbotResponse,
//     username: 'aaaaa',
//     profilePhoto: 'https://example.com/chatbot-photo.jpg', // Replace with chatbot photo URL
//     isLocal: false,
//   };
//   setMessages((prevMessages) => [...prevMessages, chatbotMessage]);
//   socket.emit('sendMessage', chatbotMessage);
//  };

 async function handleSendMessage(messageText) {
  // Add the user's message to the chat
  const userMessage = {
    text: messageText,
    username: 'You',
    isLocal: true,
  };
  setMessages((prevMessages) => [...prevMessages, userMessage]);

  // Get response from chatbot
  const chatbotResponse = await sendMessageToChatbot(messageText);
  console.log("Response from chatbot: ", chatbotResponse)
  console.log("Response from URL: ", process.env.REACT_APP_SERVER_URL)
  console.log("Running on URL: ", process.env.REACT_APP_SOCKET_URL)

  if (chatbotResponse) {
    const chatbotMessage = {
      text: chatbotResponse,
      username: 'Chatbot',
      // profilePhoto: 'https://example.com/chatbot-photo.jpg', // Replace with chatbot photo URL
      isLocal: false,
    }
    setMessages((prevMessages) => [...prevMessages, chatbotMessage]);
  };
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

