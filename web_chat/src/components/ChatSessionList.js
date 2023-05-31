// import React from 'react';
import ChatSessionItem from './ChatSessionItem';


import React, { useState, useEffect } from 'react';

function ChatSessionList({ token, onChatSessionSelect }) {
  const [chatSessions, setChatSessions] = useState([]);
  const [refreshChatSessions, setRefreshChatSessions] = useState(false);

  useEffect(() => {
    fetch(process.env.REACT_APP_SERVER_URL + '/chat_sessions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Received ${data.chat_sessions.length} chat sessions`);
      console.log(data.chat_sessions);
      setChatSessions(data.chat_sessions);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    // Reset the refreshChatSessions flag to false after the refresh is done
    setRefreshChatSessions(false);
  }, [token, refreshChatSessions]);

  return (
    <div className="chat-session-list">
      {chatSessions.map(chatSession => (
        <ChatSessionItem
          key={chatSession.id}
          chatSession={chatSession}
          onSelect={onChatSessionSelect}
        />
      ))}
    </div>
  );
}

export default ChatSessionList;



// class ChatSessionList extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             chatSessions: []
//         }
//     }

//     componentDidMount() {
//         console.log("fetching chat sessions...")
//         fetch(process.env.REACT_APP_SERVER_URL + '/chat_sessions', {
//             headers: {
//                 'Authorization': `Bearer ${this.props.token}`
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log(`Received ${data.chat_sessions.length} chat sessions`);
//             console.log(data.chat_sessions);
//             this.setState({ chatSessions: data.chat_sessions });
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//         });
//     }

//     render() {
//         return (
//             <div>
//                 <h2>Chat Sessions</h2>
//                 {this.state.chatSessions.map((chatSession, index) => 
//                     <ChatSessionItem 
//                         key={index} 
//                         chatSession={chatSession}
//                         // passing the handleChatSessionSelect prop down to ChatSessionItem
//                         onSelect={this.props.onChatSessionSelect} 
//                     />
//                 )}
//             </div>
//         )
//     }
// }

// export default ChatSessionList;
