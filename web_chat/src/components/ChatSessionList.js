import React, { useState, useEffect, useCallback } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import ChatSessionItem from './ChatSessionItem';


function ChatSessionList({ token, onChatSessionSelect, refreshChatSessionsSignal }) {
  const [chatSessions, setChatSessions] = useState([]);

  const fetchChatSessions = useCallback(() => {
    fetch(process.env.REACT_APP_SERVER_URL + '/chat_sessions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Received ${data.chat_sessions.length} chat sessions`);
      console.log(data.chat_sessions);
      setChatSessions(data.chat_sessions);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }, [token]);

  useEffect(() => {
    fetchChatSessions();
  }, [token, refreshChatSessionsSignal, fetchChatSessions]);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="chat sessions">
        {chatSessions.map(chatSession => (
          <ListItem button key={chatSession.id}>
            <ChatSessionItem 
              chatSession={chatSession} 
              onSelect={onChatSessionSelect}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ChatSessionList;