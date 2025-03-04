import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logIn} from '../store/actions/auth';
import Message from '../components/Message';
import Form from '../components/Form';
import PropTypes from 'prop-types';
import './LoginPage.css';

class LoginPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			username: '',
			password: '',
			loading: false,
			error: ''
		};
	}
	
	onChange = e => {
		this.setState({...this.state, [e.target.name]: e.target.value});
	}
	
	onSubmit = e => {
		e.preventDefault();
		this.setState({...this.state, loading: true})
		this.props.logIn(e.target.username.value, e.target.password.value)
			.then(() => {
				this.setState({...this.state, loading: false, error: ''});
				this.props.history.push('/accounts');
			})
			.catch(err => {
				this.setState({...this.state, loading: false, error: err});
			});
	}
	
	render() {
		const {username, password, loading, error} = this.state;
		
		const fields = [
			{label: 'Username', name: 'username', type: 'text', value: username},
			{label: 'Password', name: 'password', type: 'password', value: password},	
		];

		return (
			<div>
				<h2 className='LoginPage-message' key='LoginPage-message'>Log in to Bank of Wasserstein.</h2>
				{error && (
					<Message color='red'>
						{error}
					</Message>
				)}
				<Form onSubmit={this.onSubmit} 
						onChange={this.onChange} 
						loading={loading}
						fields={fields}	/>
			</div>
		);
	}
}

LoginPage.propTypes = {
	logIn: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired
};

export default connect(null, {logIn})(LoginPage);