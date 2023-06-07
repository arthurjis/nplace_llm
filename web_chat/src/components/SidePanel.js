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
            }}
        >
            <div style={{ overflow: 'auto', marginBottom: '10pt' }}>
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
                    width: '90%',
                    margin: 'auto 10pt 0pt 10pt',
                    height: '32pt',
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
                    width: '90%',
                    margin: '10pt 10pt 15pt 10pt',
                    height: '32pt',
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
