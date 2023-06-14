import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketIOClient from "socket.io-client";
import ChatPanel from './ChatPanel';
import SidePanel from './SidePanel';
import SocketContext from '../contexts/SocketContext';
import { Box } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/system';



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
        newSocket.on('error', function (error) {
            // Handle the error here.
            console.error('Error:', error);
        });
        setSocket(newSocket);
        // Return function to clean up socket connection on unmount
        return () => {
            newSocket.off('error');
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const minChatPanelWidth = 320;    // in px
    const maxChatPanelWidth = 650;    // in px
    const sidePanelWidth = 260;       // in px
    const marginBetweenPanels = 30;   // in px
    const panelHeightPercentage = isMobile ? 100 : 90; // in %
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
                    width: '100%',
                    height: '100%',
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
                                    : `${sidePanelOpen ? Math.max(width - maxChatPanelWidth, 0) / 2 : (width - maxChatPanelWidth) / 2 - sidePanelWidth - 2}px`,
                                transition: buttonClicked // Only transition if button was clicked
                                    ? 'left 0.5s ease-out'
                                    : undefined,
                                zIndex: isLargeScreen
                                    ? (sidePanelOpen && !buttonClicked) ? 3 : 1 // Put forth SidePanel when SidePanel open and not in transition
                                    : (sidePanelOpen || buttonClicked) ? 3 : 1, // Put forth SidePanel when SidePanel open and in transition
                            }}
                        >
                            <Box // SidePanel
                                sx={{
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

                        {
                            (!isLargeScreen) &&
                            <Box // Blank Box to cover the deactivated SidePanel for smaller screens
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${Math.max(width - maxChatPanelWidth, 0) / 2 - 1}px`,
                                    backgroundColor: 'background',
                                    zIndex: 5
                                }}
                            />
                        }

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
                                paddingLeft: (sidePanelOpen && isLargeScreen) ? `${sidePanelWidth + marginBetweenPanels}px` : '0px',
                                transition: 'padding 0.5s ease',
                                zIndex: 2,
                                // border: 1,
                                // borderColor: '#AA1231',
                                // borderRadius: '0',
                                // borderStyle: 'dashed',
                            }}
                            onClick={() => { if (!isLargeScreen && sidePanelOpen) handleDrawerToggle(); }}
                        >
                            <Box // ChatPanel
                                sx={{
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <ChatPanel
                                    token={token}
                                    selectedChatSession={selectedChatSession}
                                    setSelectedChatSession={setSelectedChatSession}
                                    refreshChatSessions={handleRefreshChatSessions}
                                    handleDrawerToggle={handleDrawerToggle}
                                />
                            </Box>
                        </Box>
                    </>
                ) : (<p>Connecting...</p>)}
            </Box >
        </SocketContext.Provider>
    );
};

export default ChatPage;
