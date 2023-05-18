import React from 'react';
import ChatSessionItem from './ChatSessionItem';

class ChatSessionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatSessions: []
        }
    }

    componentDidMount() {
        console.log("fetching chat sessions...")
        fetch(process.env.REACT_APP_SERVER_URL + '/chat_sessions', {
            headers: {
                'Authorization': `Bearer ${this.props.token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Received ${data.chat_sessions.length} chat sessions`);
            this.setState({ chatSessions: data.chat_sessions });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    render() {
        return (
            <div>
                <h2>Chat Sessions</h2>
                {this.state.chatSessions.map((chatSession, index) => 
                    <ChatSessionItem key={index} chatSession={chatSession} />
                )}
            </div>
        )
    }
}

export default ChatSessionList;
