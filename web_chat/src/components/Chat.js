import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';


function Chat({ token, selectedChatSession, setSelectedChatSession, refreshChatSessions }) {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (selectedChatSession) {
      // Load chat history from the server
      fetch(process.env.REACT_APP_SERVER_URL + '/chat_history/' + selectedChatSession, {
        headers: {
          'Authorization': `Bearer ${token}`
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
    else {
      setMessages([]);
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
  }, [socket, setSelectedChatSession]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
  }, [messages]);

  function handleSendMessage(messageText) {
    // Add the user's message to the chat
    const userMessage = {
      chat_session_id: selectedChatSession,
      text: messageText,
      username: 'You',
      isLocal: true,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (!selectedChatSession) {
      socket.emit('start_chat', {}, (response) => {
        setSelectedChatSession(response.chat_session_id);
        userMessage.chat_session_id = response.chat_session_id;
        socket.emit('send_message', userMessage);
        console.debug('Sent message: ', userMessage);
        refreshChatSessions();
      });
    } else {
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
