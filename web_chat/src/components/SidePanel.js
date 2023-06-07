import React from 'react';
import Button from '@mui/material/Button';
import ChatSessionList from './ChatSessionList';

function SidePanel({ token, onChatSessionSelect, refreshChatSessionsSignal, handleStartChat, handleLogout, userEmail }) {
    return (
        <div className="side-panel"
            style={{
                backgroundColor: '#f6ebbe',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '30px',
                padding: '0pt 16pt'

            }}
        >
            <div style={{ overflow: 'auto', marginBottom: '10pt', marginTop: '20pt' }}>
                <ChatSessionList
                    token={token}
                    onChatSessionSelect={onChatSessionSelect}
                    refreshChatSessionsSignal={refreshChatSessionsSignal}
                />
            </div>

            <Button
                variant="contained"
                onClick={handleStartChat}
                style={{
                    width: '100%',
                    marginTop: 'auto',
                    height: '44px',
                    borderRadius: '15px',
                    textTransform: 'none',
                    fontSize: '16px',
                }}
                sx={{
                    backgroundColor: 'primary.light',
                }}
            >
                Start Chat
            </Button>

            <Button
                variant="contained"
                onClick={handleLogout}
                style={{
                    width: '100%',
                    marginTop: '10px',
                    marginBottom: '20px',
                    height: '44px',
                    borderRadius: '15px',
                    textTransform: 'none',
                    fontSize: '16px',
                }}
                sx={{
                    backgroundColor: 'primary.light',
                }}
            >
                Log out
            </Button>
        </div>
    );
}

export default SidePanel;
