import React, { useState, useEffect, useCallback } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';


function ChatSessionList({ token, onChatSessionSelect, refreshChatSessionsSignal, handleLogout }) {
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChatSessionID, setSelectedChatSessionID] = useState(null);

  const fetchChatSessions = useCallback(() => {
    if (!token) {
      return;
    }
    fetch(process.env.REACT_APP_SERVER_URL + '/chat_sessions', {
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
          } else if (response.status === 404) {
            // TODO: Handle 404 status (not found)
            throw new Error("The chat session you're trying to access was not found.");
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.debug(`Received ${data.chat_sessions.length} chat sessions`);
        console.debug(data.chat_sessions);
        setChatSessions(data.chat_sessions);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [token, handleLogout]);

  const onSelectSession = (chatSession) => {
    console.debug("Selected chat session " + chatSession);
    setSelectedChatSessionID(chatSession);
    onChatSessionSelect(chatSession);
  };

  useEffect(() => {
    fetchChatSessions();
  }, [token, refreshChatSessionsSignal, fetchChatSessions]);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.sidePanel' }}>
      <List component="nav" aria-label="chat sessions">
        {chatSessions.map(chatSession => (
          <ListItemButton
            key={chatSession.id}
            onClick={() => onSelectSession(chatSession.id)}
            sx={{
              height: '64px',
              left: '1%',
              width: "98%",
              marginBottom: '12px',
              alignSelf: 'flex-start',
              borderRadius: '15px',
              boxShadow: 3,
              backgroundColor: chatSession.id === selectedChatSessionID ? 'primary.light' : 'transparent',
              '&.MuiListItemButton-root': {
                '&:hover': {
                  backgroundColor: 'primary.light', // override hover state
                },
                '&.Mui-focusVisible': {
                  backgroundColor: 'primary.light', // override focus state
                },
                '& .MuiTouchRipple-root': {
                  display: 'none', // disable ripple effect
                },
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.light', // override selected state
              },
            }}
          >
            <ListItemIcon>
              <ChatBubbleOutlineIcon
                sx={{
                  fontSize: '20px',
                  color: 'primary.main.contrastText',
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={chatSession.name}
              primaryTypographyProps={{ 
                fontSize: '1em', 
                color: 'text.primary',
                fontWeight: 500 
              }} 
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default ChatSessionList;