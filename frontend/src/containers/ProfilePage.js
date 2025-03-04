import React, {Component} from 'react';
import { connect } from 'react-redux';
import './ProfilePage.css';
import dayjs from 'dayjs';
import {apiCall} from '../services/api';
import Message from '../components/Message';
import Form from '../components/Form';
import PropTypes from 'prop-types';

class ProfilePage extends Component{
    constructor(props){
        super(props);
        this.state = {
            currentPassword: '',
            newPassword: '',
            repeatNewPassword: '',
            loading: false,
            message: '',
            messageColor: ''
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e){
        this.setState({...this.state, [e.target.name]: e.target.value});
    }

    onSubmit(e){
        e.preventDefault();
        if(this.state.newPassword !== this.state.repeatNewPassword){
            return this.setState({...this.state,
                        currentPassword: '',
                        newPassword: '',
                        repeatNewPassword: '',
                        message: 'New passwords must match',
                        messageColor: 'red'
                    });
        }

        this.setState({...this.state, loading: true});
        apiCall('POST', `/auth/changePassword`, {
            currentPassword: this.state.currentPassword,
            newPassword: this.state.newPassword,
            repeatNewPassword: this.state.repeatNewPassword
        })
            .then(response => {
                    const message = 'error' in response ? response.error : response.message;
                    const color = 'error' in response ? 'red' : 'green';
                    this.setState({
                        currentPassword: '',
                        newPassword: '',
                        repeatNewPassword: '',
                        loading: false,
                        message: message,
                        messageColor: color
                    });
            });
    }

    render() {
        const {currentPassword, newPassword, repeatNewPassword, 
            message, messageColor, loading} = this.state;
        const {username, joinDate} = this.props;

        const fields = [
            {label: 'Current Password', name: 'currentPassword', type: 'password', value: currentPassword},
            {label: 'New Password', name: 'newPassword', type: 'password', value: newPassword},
            {label: 'Repeat New Password', name: 'repeatNewPassword', type: 'password', value: repeatNewPassword}
        ];

        return (
            <div style={{marginBottom: '20px'}}>
                <h2 className='ProfilePage-message'>View your profile.</h2>
                <div className='ProfilePage-fields'>
                    <div>
                        <h3 className='ProfilePage-field-title'>Username</h3>
                        <p className='ProfilePage-field-value'>{username}</p>
                    </div>
                    <div>
                        <h3 className='ProfilePage-field-title'>Join Date</h3>
                        <p className='ProfilePage-field-value'>{dayjs(joinDate).format('MM/DD/YYYY h:mmA')}</p>
                    </div>
                </div>
                <h2 className='ProfilePage-message'>Change your password.</h2>
                {message && (
                    <Message color={messageColor} >
                        {message}
                    </Message>
                )}
                <Form onSubmit={this.onSubmit} 
                        onChange={this.onChange}
                        fields={fields}
                        loading={loading}/>
                
            </div>
        );
    }
}

function mapStateToProps(state){
    return {
        userId: state.authReducer.userId,
        username: state.authReducer.username,
        joinDate: state.authReducer.joinDate
    };
}

ProfilePage.propTypes = {
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    joinDate: PropTypes.string.isRequired
};

export default connect(mapStateToProps, null)(ProfilePage);