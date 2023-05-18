import React from 'react';
import ChatSessionItem from './ChatSessionItem';

class ChatSessionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatSessions: []
        }
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
