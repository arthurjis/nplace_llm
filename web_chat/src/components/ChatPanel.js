import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import Message from './Message';
import Input from './Input';
import SocketContext from '../contexts/SocketContext';
import { Box } from '@mui/material';



function ChatPanel({ token, selectedChatSession, setSelectedChatSession, refreshChatSessions, handleDrawerToggle, handleLogout }) {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const size = 20; // Fetch 20 messages at a time
  const scrollContainer = useRef(null);
  const previousChatSession = useRef();
  const moreMessagesToLoad = useRef(true);
  const page = useRef(1);


  const fetchChatHistory = useCallback(() => {
    if (!token || !selectedChatSession) {
      setMessages([]);
      return;
    }
    if (selectedChatSession !== previousChatSession.current) {
      setMessages([]);
      page.current = 1;
      moreMessagesToLoad.current = true;
      scrollContainer.current.scrollTop = 0;
    }

    console.debug("Try fetching page " + page.current + " from chat session " + selectedChatSession + "...");
    // Load chat history from the server
    const fetchMessages = async () => {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/chat_history/${selectedChatSession}?page=${page.current}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error("Unauthorized");
        } else if (response.status === 403) {
          throw new Error("You are not authorized to view this chat session.");
        } else if (response.status === 404) {
          throw new Error("The chat session you're trying to access was not found.");
        }
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // If the number of messages received is less than size, set hasMore to false
      if (data.messages.length < size) {
        moreMessagesToLoad.current = false;
      }
      const reversedMessages = data.messages.reverse();
      if (page.current === 1) {
        setMessages(reversedMessages);
      } else {
        const currentScrollTop = scrollContainer.current.scrollTop;
        setMessages(prevMessages => [...reversedMessages, ...prevMessages]);
        scrollContainer.current.scrollTop = currentScrollTop;
      }
      previousChatSession.current = selectedChatSession;
      console.debug("Loaded ", data.messages.length, " messages for page ", page.current, ", moreMessagesToLoad: " + moreMessagesToLoad.current);

    };

    fetchMessages().catch((error) => {
      console.error('Error:', error);
    });
  }, [selectedChatSession, token, handleLogout]);

  useEffect(() => {
    fetchChatHistory();
  }, [selectedChatSession, token, fetchChatHistory])

  useEffect(() => {
    const currentScrollContainer = scrollContainer.current;

    const handleScroll = () => {
      if (!currentScrollContainer) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = currentScrollContainer;
      // Check if we're at the top of the scroll container, negative here because flex-direction: column-reverse
      if (scrollTop - clientHeight + scrollHeight < 5 && clientHeight !== scrollHeight) {
        console.debug('Scrolled to top');
        console.log(scrollTop, clientHeight, scrollHeight);
        if (moreMessagesToLoad.current === true) {
          console.debug('Found more messages, loading new page');
          page.current += 1;
          fetchChatHistory();
        }
      }
    };

    currentScrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      if (currentScrollContainer) {
        currentScrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fetchChatHistory]);


  useEffect(() => {
    // Listen for new messages from the server
    socket.on('new_message', (message) => {
      console.debug("Received message: " + JSON.stringify(message));
      setMessages((prevMessages) => [...prevMessages, message]);
      setScrollToBottom(true);
    });

    // Listen for 'chat_session_started' from the server
    socket.on('chat_session_started', (data) => {
      setSelectedChatSession(data.chat_session_id);
      console.debug('Chat session started with id: ' + data.chat_session_id);
    });

    return () => {
      // Clean up the listener when the component is unmounted
      socket.off('new_message');
      socket.off('chat_session_started');
    };
  }, [socket, setSelectedChatSession]);

  useEffect(() => {
    if (scrollToBottom && scrollContainer.current) {
      scrollContainer.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Reset the scroll state after scrolling
      setScrollToBottom(false);
    }
  }, [scrollToBottom]);

  function handleSendMessage(messageText) {
    // Add the user's message to the chat
    const userMessage = {
      chat_session_id: selectedChatSession,
      text: messageText,
      username: 'You',
      isLocal: true,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setScrollToBottom(true);

    if (!selectedChatSession) {
      socket.emit('start_chat', {}, (response) => {
        userMessage.chat_session_id = response.chat_session_id;
        socket.emit('send_message', userMessage);
        console.debug('Sent message: ', userMessage);
        refreshChatSessions();
      });
    } else {
      socket.emit('send_message', userMessage);
      console.debug('Sent message: ', userMessage);
    }
  }


  return (
    <Box
      sx={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        width: '100%',
        borderRadius: '30px',   // Finetune
        backgroundColor: 'background.chatPanel',   // Finetune
        boxShadow: 2,
      }}
    >


      <Box
        sx={{
          position: 'relative',
          overflow: 'auto',
          flex: '1 1 auto',
          padding: '0em 1em',
          margin: '30px 0px 15px 0px',
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
        ref={scrollContainer}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {messages.map((message, index) => (
            <Message key={index} message={message} isLocal={message.isLocal} likedByRemote={false} />
          ))}
        </Box>
      </Box>
      <Box
      >
        <Input className="chat-input"
          onSendMessage={handleSendMessage}
          handleMenuClick={handleDrawerToggle}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30px',
          left: '0',
          right: '0',
          height: '10px',
          background: 'linear-gradient(180deg, rgba(252,250,245,1) 0%, rgba(252,250,245,0) 100%)',  // Manually coverted chatPanelBG to RBG
        }}
      >
      </Box>
    </Box>

  );
}

export default ChatPanel;
