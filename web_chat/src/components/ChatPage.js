import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketIOClient from "socket.io-client";
import Chat from './Chat';
import SidePanel from './SidePanel';
import SocketContext from '../contexts/SocketContext';
import { Box, Drawer, Hidden } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';




const ChatPage = ({ token, onLogout }) => {
    const [socket, setSocket] = useState(null);
    const [selectedChatSession, setSelectedChatSession] = useState(null);
    const [refreshChatSessionsSignal, setRefreshChatSessionsSignal] = useState(Date.now());
    const navigate = useNavigate();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [width, setWidth] = React.useState(window.innerWidth);
    React.useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isLargeScreen = width >= 1000;

    const handleDrawerToggle = () => {
        console.log("setMobileOpen " + !mobileOpen);
        setMobileOpen(!mobileOpen);

    };


    // useEffect(() => {
    //     if (!token) {
    //         navigate("/login");
    //     }
    // }, [token, navigate]);

    const handleLogout = () => {
        if (socket) {
            socket.close();
            setSocket(null);
        }
        setSelectedChatSession(null);
        onLogout();
    };

    // const handleStartChat = () => {
    //     setSelectedChatSession(null);
    // };

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
        // <SocketContext.Provider value={socket}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100vw',
                    height: '98vh',
                    marginLeft: (width >=650) ? '0pt' : `${(650 - width)/2+1}px`,
                    position: 'absolute',
                }}
            >
                {/* {socket ? ( */}
                    <>
                        {/* <Box // SidePanel Parent Container
                            sx={{
                                position: 'absolute',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '80%',
                                width: '300px',
                                backgroundColor: 'transparent',
                                paddingRight: mobileOpen ? '680px' : '350px',
                                transition: 'padding 0.5s ease',
                                zIndex: 1,
                                border: 1,
                                borderColor: '#AA1231',
                                borderStyle: 'dashed',
                            }}
                        >
                            <Box // SidePanel
                                sx={{
                                    backgroundColor: 'gray',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >

                            </Box>
                        </Box> */}

                        <Box // ChatPanel Parent Container
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '80%',
                                width: '100%',
                                maxWidth: '650px',
                                minWidth: '650px',
                                backgroundColor: 'transparent',
                                paddingLeft: mobileOpen ? '330px' : '0px',
                                transition: 'padding 0.5s ease',
                                zIndex: 2,
                                border: 2,
                                borderColor: '#AA1231',
                                borderRadius: '0',
                                borderStyle: 'solid',
                            }}
                        >
                            <Box // ChatPanel
                                sx={{
                                    backgroundColor: 'yellow',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                {/* <Chat
                                    token={token}
                                    selectedChatSession={selectedChatSession}
                                    setSelectedChatSession={setSelectedChatSession}
                                    refreshChatSessions={handleRefreshChatSessions}
                                /> */}
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
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </>
                {/* ) : (<p>Connecting...</p>)} */}
            </Box>
        // </SocketContext.Provider>
    );
};

export default ChatPage;



        // <SocketContext.Provider value={socket}>
        //     <Box
        //         sx={{
        //             display: 'flex',
        //             flexDirection: 'row',
        //             alignItems: 'center',
        //             justifyContent: 'center',
        //             height: '100vh',
        //             backgroundColor: '#FFFFAA',
        //         }}
        //     >
        //         {socket ? (
        //             <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
        //                 <Hidden smDown implementation="css">
        //                     <Box
        //                         sx={{
        //                             bgcolor: 'white',
        //                             border: 2,
        //                             borderColor: 'primary.main',
        //                             borderRadius: '12px',
        //                             borderStyle: 'solid',
        //                             p: 2,
        //                             height: '80vh',
        //                             overflowY: 'scroll',
        //                             width: 300,
        //                         }}
        //                     >
        //                         {/* <SidePanel
        //                                 token={token}
        //                                 onChatSessionSelect={handleChatSessionSelect}
        //                                 refreshChatSessionsSignal={refreshChatSessionsSignal}
        //                                 onLogout={handleLogout}
        //                             /> */}
        //                     </Box>
        //                 </Hidden>

        //                 <Box
        //                     sx={{
        //                         bgcolor: 'white',
        //                         border: 2,
        //                         borderColor: '#AA1231',
        //                         borderRadius: '12px',
        //                         borderStyle: 'solid',
        //                         p: 2,
        //                         height: '80vh',
        //                         overflowY: 'scroll',
        //                         // flexGrow: 1,
        //                         // maxWidth: 900,
        //                         minWidth: 600,
        //                     }}
        //                 >
        //                     {/* <Chat
        //                             token={token}
        //                             selectedChatSession={selectedChatSession}
        //                             setSelectedChatSession={setSelectedChatSession}
        //                             refreshChatSessions={handleRefreshChatSessions}
        //                         /> */}
        //                 </Box>

        //                 <Hidden mdUp implementation="js">
        //                     <Drawer
        //                         variant="temporary"
        //                         open={mobileOpen}
        //                         onClose={handleDrawerToggle}
        //                         ModalProps={{
        //                             keepMounted: true, // Better open performance on mobile.
        //                         }}
        //                     >
        //                         <SidePanel
        //                             token={token}
        //                             onChatSessionSelect={handleChatSessionSelect}
        //                             refreshChatSessionsSignal={refreshChatSessionsSignal}
        //                             onLogout={handleLogout}
        //                         />
        //                     </Drawer>
        //                 </Hidden>
        //             </Box>
        //         ) : (
        //             <p>Connecting...</p>
        //         )}
        //     </Box>

        // </SocketContext.Provider>