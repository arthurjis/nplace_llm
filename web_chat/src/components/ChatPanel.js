import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import './Chat.css';
import SocketContext from '../contexts/SocketContext';
import { Box } from '@mui/material';



function ChatPanel({ token, selectedChatSession, setSelectedChatSession, refreshChatSessions, handleDrawerToggle }) {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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
  }, [selectedChatSession, token]);

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
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <Box
      sx={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        width: '100%',
        borderRadius: '30px',   // Finetune
        backgroundColor: 'chatPanelBG',   // Finetune
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'auto',
          flex: '1 1 auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {messages.map((message, index) => (
            <Message key={index} message={message} isLocal={message.isLocal} likedByRemote={true} />
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Box>


      {/* <Box
        sx={{
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      > */}

      {/* </Box> */}
      {/* <Box sx={{ flexGrow: 1 }} /> */}
      <Input className="chat-input"
        onSendMessage={handleSendMessage}
        handleMenuClick={handleDrawerToggle}
      />
    </Box>

  );
}

export default ChatPanel;
