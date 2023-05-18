import React from 'react';

class ChatSessionItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { chatSession } = this.props;
        return (
            <div>
                <h3>{chatSession.name}</h3>
                <p>Last opened: {chatSession.last_opened}</p>
            </div>
        )
    }
}

export default ChatSessionItem;
