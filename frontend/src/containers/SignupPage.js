import React, {Component} from 'react';
import {connect} from 'react-redux';
import {signUp} from '../store/actions/auth';
import Message from '../components/Message';
import Form from '../components/Form';
import PropTypes from 'prop-types';
import './SignupPage.css';

class SignupPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			username: '',
			password: '',
			repeatPassword: '',
			loading: false,
			error: ''
		};
	}
	
	onChange = e => {
		this.setState({...this.state, [e.target.name]: e.target.value});
	}
	
	onSubmit = e => {
		e.preventDefault();
		this.setState({...this.state, loading: true});
		if(this.state.password !== this.state.repeatPassword){
			return this.setState({...this.state, loading: false, error: "Your passwords don't match"});
		}
		this.props.signUp(this.state.username, this.state.password)
			.then(() => {
				this.setState({...this.state, loading: false, error: ''});
				this.props.history.push('/accounts');
			})
			.catch(err => {
				this.setState({...this.state, loading: false, error: err});
			});
	}
	
	render() {
		const {username, password, repeatPassword, error, loading} = this.state;

		const fields = [
			{label: 'Username', name: 'username', type: 'text', value: username},
			{label: 'Password', name: 'password', type: 'password', value: password},
			{label: 'Repeat Password', name: 'repeatPassword', type: 'password', value: repeatPassword}
		];

		return (
			<div>
				<h2 className='SignupPage-message'>Make an account.</h2>
				{error && (
					<Message>
						{error}
					</Message>
				)}
				<Form onSubmit={this.onSubmit} 
						onChange={this.onChange}
						fields={fields}
						loading={loading} />
			</div>
		);
	}
}

SignupPage.propTypes = {
	signUp: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired
};

export default connect(null, {signUp})(SignupPage);