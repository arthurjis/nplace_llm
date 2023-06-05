import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketIOClient from "socket.io-client";
import Chat from './Chat';
import SidePanel from './SidePanel';
import SocketContext from '../contexts/SocketContext';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';


const ChatPage = ({ token, onLogout }) => {
    // Chat-related
    const [socket, setSocket] = useState(null);
    const [selectedChatSession, setSelectedChatSession] = useState(null);
    const [refreshChatSessionsSignal, setRefreshChatSessionsSignal] = useState(Date.now());
    const navigate = useNavigate();
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
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);
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

    // UI-related
    const [sidePanelOpen, setSidePanelOpen] = React.useState(false);
    const [width, setWidth] = React.useState(window.innerWidth);
    const [buttonClicked, setButtonClicked] = React.useState(false);
    const minChatPanelWidth = 320;    // in px
    const maxChatPanelWidth = 650;    // in px
    const sidePanelWidth = 260;       // in px
    const marginBetweenPanels = 30;   // in px
    const panelHeightPercentage = 90; // in %
    const isLargeScreen = width >= maxChatPanelWidth + sidePanelWidth + marginBetweenPanels;
    const handleDrawerToggle = () => {
        setSidePanelOpen(!sidePanelOpen);
        setButtonClicked(true);
        console.debug("SidePanelOpen " + !sidePanelOpen);
        setTimeout(() => setButtonClicked(false), 500);
    };
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <SocketContext.Provider value={socket}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100vw',
                    height: '100vh',
                    position: 'absolute',
                    marginLeft: (width >= minChatPanelWidth) ? '0pt' : `${(minChatPanelWidth - width) / 2 + 1}px`, // In case where viewport width is less than content width and scrollX is enabled, add margin to push content to viewport center
                    backgroundColor: 'background',
                }}
            >
                {socket ? (
                    <>
                        <Box // SidePanel Parent Container, viewport wide enough to place two panels side by side
                            sx={{
                                position: 'absolute',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: `${panelHeightPercentage}%`,
                                width: `${sidePanelWidth}px`,
                                backgroundColor: 'transparent',
                                left: isLargeScreen
                                    ? `${sidePanelOpen ? (width - maxChatPanelWidth - sidePanelWidth - marginBetweenPanels) / 2 : Math.max(width - maxChatPanelWidth, 0) / 2}px`
                                    : `${sidePanelOpen ? Math.max(width - maxChatPanelWidth, 0) / 2 : (width - maxChatPanelWidth) / 2 - sidePanelWidth}px`,
                                transition: buttonClicked // Only transition if button was clicked
                                    ? 'left 0.5s ease'
                                    : undefined,
                                zIndex: sidePanelOpen ? 3 : 1,
                            }}
                        >
                            <Box // SidePanel
                                sx={{
                                    backgroundColor: 'gray',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <SidePanel
                                    token={token}
                                    onChatSessionSelect={handleChatSessionSelect}
                                    refreshChatSessionsSignal={refreshChatSessionsSignal}
                                    handleStartChat={handleStartChat}
                                    handleLogout={handleLogout}
                                />
                            </Box>
                        </Box>
                        <Box // ChatPanel Parent Container
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: `${panelHeightPercentage}%`,
                                width: '100%',
                                maxWidth: `${maxChatPanelWidth}px`,
                                minWidth: `${minChatPanelWidth}px`,
                                backgroundColor: 'transparent',
                                paddingLeft: (sidePanelOpen && isLargeScreen) ? `${sidePanelWidth + marginBetweenPanels}px` : '0px',
                                transition: 'padding 0.5s ease',
                                zIndex: 2,
                                border: 1,
                                borderColor: '#AA1231',
                                borderRadius: '0',
                                borderStyle: 'dashed',
                            }}
                        >
                            <Box // ChatPanel
                                sx={{
                                    backgroundColor: 'white',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <Chat
                                    token={token}
                                    selectedChatSession={selectedChatSession}
                                    setSelectedChatSession={setSelectedChatSession}
                                    refreshChatSessions={handleRefreshChatSessions}
                                />
                            </Box>
                        </Box>

                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{
                                position: 'fixed',
                                bottom: 20,
                                right: 20,
                                bgcolor: 'white',
                                borderRadius: '50%',
                                zIndex: 5
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </>
                ) : (<p>Connecting...</p>)}
            </Box >
        </SocketContext.Provider>
    );
};

export default ChatPage;
