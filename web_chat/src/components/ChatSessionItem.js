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
                <h3>{name}</h3>
            </div>
        );
    }
}

export default ChatSessionItem;
