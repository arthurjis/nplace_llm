import React, { useState, useEffect, useContext, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import SocketContext from '../contexts/SocketContext';
import { Box } from '@mui/material';



function ChatPanel({ token, selectedChatSession, setSelectedChatSession, refreshChatSessions, handleDrawerToggle, handleLogout }) {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    if (selectedChatSession) {
      // Load chat history from the server
      fetch(process.env.REACT_APP_SERVER_URL + '/chat_history/' + selectedChatSession, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) {
            if (response.status === 401) {
              // TODO: Handle 401 status (bad token)
              handleLogout();
              throw new Error("Unauthorized");
            } else if (response.status === 403) {
              // TODO: Handle 403 status (forbidden)
              throw new Error("You are not authorized to view this chat session.");
            } else if (response.status === 404) {
              // TODO: Handle 404 status (not found)
              throw new Error("The chat session you're trying to access was not found.");
            }
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
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
  }, [selectedChatSession, token, handleLogout]);

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
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        width: '100%',
        borderRadius: '30px',   // Finetune
        backgroundColor: 'background.chatPanel',   // Finetune
        boxShadow: 2,
      }}
    >


      <Box
        sx={{
          position: 'relative',
          overflow: 'auto',
          flex: '1 1 auto',
          padding: '0em 1em',
          margin: '30px 0px 15px 0px',
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
            <Message key={index} message={message} isLocal={message.isLocal} likedByRemote={false} />
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Box>
      <Box
      >
        <Input className="chat-input"
          onSendMessage={handleSendMessage}
          handleMenuClick={handleDrawerToggle}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30px',
          left: '0',
          right: '0',      
          height: '10px',
          background: 'linear-gradient(180deg, rgba(252,250,245,1) 0%, rgba(252,250,245,0) 100%)',  // Manually coverted chatPanelBG to RBG
        }}
      >
      </Box>
    </Box>

  );
}

export default ChatPanel;
