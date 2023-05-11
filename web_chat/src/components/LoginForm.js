import React from 'react';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { id: '', passcode: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onLogin(this.state.id, this.state.passcode);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    ID:
                    <input type="text" name="id" onChange={this.handleChange} />
                </label>
                <label>
                    Passcode:
                    <input type="password" name="passcode" onChange={this.handleChange} />
                </label>
                <input type="submit" value="Log In" />
            </form>
        );
    }
}

export default LoginForm;
