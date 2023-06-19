import React from 'react';
import Button from '@mui/material/Button';
import ChatSessionList from './ChatSessionList';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';


function SidePanel({ token, selectedChatSession, setSelectedChatSession, refreshChatSessionsSignal, handleStartChat, handleLogout }) {
    const { lang } = useParams();
    const validLanguages = ['en', 'zh'];
    const language = validLanguages.includes(lang) ? lang : 'en';  // Fallback to 'en' if invalid
    const { t, i18n } = useTranslation();
    const [userName, setUserName] = useState('');

    const fetchUsername = useCallback(() => {
        if (!token) {
            return;
        }
        fetch(process.env.REACT_APP_SERVER_URL + '/get_username', {
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
                console.debug(`Fetched username ${data.username} `);
                setUserName(data.username);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [token, handleLogout]);


    // Change language based on the URL parameter
    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);
    useEffect(() => {
        fetchUsername();
    }, [token, fetchUsername])

    return (
        <Box
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '30px',
                padding: '0pt 16pt',
            }}
            sx={{
                backgroundColor: 'background.sidePanel',
                // boxShadow: 2,
            }}
        >
            <div style={{ overflow: 'auto', marginBottom: '10pt', marginTop: '20pt', flexDirection: 'column', flexGrow: 1 }}>
                <ChatSessionList
                    token={token}
                    selectedChatSession={selectedChatSession}
                    setSelectedChatSession={setSelectedChatSession}
                    refreshChatSessionsSignal={refreshChatSessionsSignal}
                    handleLogout={handleLogout}
                />
            </div>

            <Box
                sx={{
                    height: '2px',
                    backgroundColor: 'primary.dark',
                    my: '10px',
                }}
            />
            <Typography
                variant="body1"
                component="span"
                sx={{
                    alignSelf: 'center',
                    mb: '10px',
                    color: 'text.primary',
                }}
            >
                {userName}
            </Typography>
            <Button
                variant="contained"
                onClick={handleStartChat}
                style={{
                    width: '100%',
                    marginTop: 'auto',
                    height: '47px',
                    borderRadius: '15px',
                    textTransform: 'none',
                    fontSize: '18px',
                }}
                sx={{
                    backgroundColor: 'primary.light',
                    '&:hover': {
                        bgcolor: 'primary.light', // same color on hover
                    },
                    '&:focus': {
                        boxShadow: 2, // no shadow when button is focused (clicked or navigated to via keyboard)
                    },
                }}
            >
                {t('sidePanel.startNewChat')}
            </Button>

            <Button
                variant="contained"
                onClick={handleLogout}
                style={{
                    width: '100%',
                    marginTop: '10px',
                    marginBottom: '30px',
                    height: '47px',
                    borderRadius: '15px',
                    textTransform: 'none',
                    fontSize: '18px',
                }}
                sx={{
                    backgroundColor: 'primary.light',
                    '&:hover': {
                        bgcolor: 'primary.light', // same color on hover
                    },
                    '&:focus': {
                        boxShadow: 2, // no shadow when button is focused (clicked or navigated to via keyboard)
                    },
                }}
            >
                {t('sidePanel.logOut')}
            </Button>
        </Box>
    );
}

export default SidePanel;
