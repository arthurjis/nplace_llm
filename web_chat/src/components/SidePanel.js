import React from 'react';
import Button from '@mui/material/Button';
import ChatSessionList from './ChatSessionList';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';




function SidePanel({ token, onChatSessionSelect, refreshChatSessionsSignal, handleStartChat, handleLogout, userEmail }) {
    const { lang } = useParams();
    const validLanguages = ['en', 'zh'];
    const language = validLanguages.includes(lang) ? lang : 'en';  // Fallback to 'en' if invalid
    const { t, i18n } = useTranslation();
    // Change language based on the URL parameter
    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);

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
                boxShadow: 5,
            }}
        >
            <div style={{ overflow: 'auto', marginBottom: '10pt', marginTop: '20pt', flexDirection: 'column', flexGrow: 1 }}>
                <ChatSessionList
                    token={token}
                    onChatSessionSelect={onChatSessionSelect}
                    refreshChatSessionsSignal={refreshChatSessionsSignal}
                    handleLogout={handleLogout}
                />
            </div>

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
                }}
            >
                {t('sidePanel.logOut')}
            </Button>
        </Box>
    );
}

export default SidePanel;
