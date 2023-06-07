import React from 'react';

class ChatSessionItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.onSelect(this.props.chatSession.id);
    }

    render() {
        const { name } = this.props.chatSession;
        return (
            <div onClick={this.handleClick}>
                <p style={{ fontSize: '1em', color: '#444444' }}>{name}</p>
            </div>
        );
    }
}

export default ChatSessionItem;
