import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketIOClient from "socket.io-client";
import Chat from './Chat'; // Please adjust the import paths according to your project structure
import ChatSessionList from './ChatSessionList'; // Same here
import SocketContext from '../contexts/SocketContext';


const ChatPage = ({ token, onLogout }) => {
    const [socket, setSocket] = useState(null);
    const [selectedChatSession, setSelectedChatSession] = useState(null);
    const [refreshChatSessionsSignal, setRefreshChatSessionsSignal] = useState(Date.now());

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleLogout = () => {
        if (socket) {
            socket.close();
            setSocket(null);
        }
        setSelectedChatSession(null);
        onLogout();
    };

    const handleStartChat = () => {
        setSelectedChatSession(null);
    };

    const handleChatSessionSelect = (chatSession) => {
        setSelectedChatSession(chatSession);
    };

    const handleRefreshChatSessions = () => {
        setRefreshChatSessionsSignal(Date.now());
    };

    useEffect(() => {
        // Initialize socket connection here
        const newSocket = socketIOClient(process.env.REACT_APP_SERVER_URL, {
            query: { token }
        });
        setSocket(newSocket);

        // Return function to clean up socket connection on unmount
        return () => {
            newSocket.close();
        };
    }, [token]);

    useEffect(() => {
        if (socket) {
            console.log("Socket initialized");
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            <div className="ChatPage">
                {socket ? (
                    <>
                        <div className="flex-container">
                            <ChatSessionList
                                token={token}
                                onChatSessionSelect={handleChatSessionSelect}
                                refreshChatSessionsSignal={refreshChatSessionsSignal}
                            />
                            <div>
                                <Chat
                                    token={token}
                                    selectedChatSession={selectedChatSession}
                                    setSelectedChatSession={setSelectedChatSession}
                                    refreshChatSessions={handleRefreshChatSessions}
                                />
                                <button onClick={handleStartChat}>Start New Chat Session</button>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Connecting...</p>
                )}
            </div>
        </SocketContext.Provider>



    );
};

export default ChatPage;
