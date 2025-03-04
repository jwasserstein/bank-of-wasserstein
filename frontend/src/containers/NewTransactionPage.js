import React, {Component} from 'react';
import {connect} from 'react-redux';
import {generateTransactions, createTransaction, getTransactions} from '../store/actions/transactions';
import NewTransactionForm from '../components/NewTransactionForm';
import Message from '../components/Message';
import {getAccounts} from '../store/actions/accounts';
import RadioContainer from '../components/RadioContainer';
import PropTypes from 'prop-types';
import './NewTransactionPage.css';

class NewTransactionPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			number: '',
			amount: '',
			counterparty: '',
			transactionType: 'Deposit',
			accountTypeAnotherUser: '',
			accountTypeBetweenAcc: '',
			err: '',
			loading: false
		};
		this.create = this.create.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	componentDidMount(){
        if(!this.props.lastUpdated){
            this.props.getAccounts();
        }
    }
	
	create(transaction){
		const accountId = this.props.match.params.accountId;
		this.setState({...this.state, loading: true});
		return this.props.createTransaction(transaction, accountId)
			.then(() => {
				this.setState({...this.state, loading: false, err: ''});
				this.props.history.push(`/accounts/${accountId}`);
			})
			.catch(err => this.setState({...this.state, loading: false, err: err.message}));
	}

	onSubmit(e){
		e.preventDefault();
		const accountId = this.props.match.params.accountId;
		switch(this.state.transactionType){
			case 'Deposit':
				this.create({
					amount: this.state.amount,
					type: 'Deposit',
					description: 'Deposit'
				});
				break;
			case 'Withdrawal':
				this.create({
					amount: -1*this.state.amount,
					type: 'Withdrawal',
					description: 'Withdrawal'
				});
				break;
			case 'Transfer to another user':
				this.create({
					amount: -1*this.state.amount,
					counterparty: this.state.counterparty,
					accountType: this.state.accountTypeAnotherUser,
					type: 'Transfer',
					description: 'Transfer to ' + this.state.counterparty
				});
				break;
			case 'Transfer between my accounts':
				this.create({
					amount: -1*this.state.amount,
					counterparty: this.props.username,
					accountType: this.state.accountTypeBetweenAcc,
					type: 'Transfer',
					description: `Transfer to my ${this.state.accountTypeBetweenAcc} account`
				})
				.then(() => {
					this.props.getAccounts();
					const recipientAccountId = this.props.accounts.find(a => a.type === this.state.accountTypeBetweenAcc)._id;
					this.props.getTransactions(recipientAccountId);
				});
				break;
			case 'Generate':
				this.setState({...this.state, loading: true});
				this.props.generateTransactions(+this.state.number, accountId)
					.then(() => {
						this.setState({...this.state, loading: false, err: ''});
						this.props.history.push(`/accounts/${accountId}`);
					})
					.catch(err => this.setState({...this.state, loading: false, err: err.message}));
				break;
			default:
				this.setState({...this.state, err: "Couldn't process request"});
		}
	}
	
	onChange(e){
		this.setState({...this.state, [e.target.name]: e.target.value});
	}
	
	render() {
		const {accounts, match} = this.props;
		const {transactionType, err, amount, counterparty, number, 
			loading, accountTypeAnotherUser, accountTypeBetweenAcc} = this.state;

		const enabledAccounts = [];
		accounts.forEach(a => {
			if(a._id !== match.params.accountId) {
				enabledAccounts.push(a.type);
			}
		});

		const radios = [
			{label: 'Deposit', checked: transactionType === 'Deposit'},
			{label: 'Withdrawal', checked: transactionType === 'Withdrawal'},
			{label: 'Transfer to another user', checked: transactionType === 'Transfer to another user'},
			{label: 'Transfer between my accounts', checked: transactionType === 'Transfer between my accounts'},
			{label: 'Generate', checked: transactionType === 'Generate'}
		];
		return (
			<div>
				<h2 className='NewTransactionPage-message'>Select a transaction type.</h2>
				<RadioContainer radios={radios} name='transactionType' onChange={this.onChange}/>
				<h2 className='NewTransactionPage-message'>Enter your transaction details.</h2>
				{err && (
					<Message>
						{err}
					</Message>
				)}
				<NewTransactionForm transactionType={transactionType} amount={amount} 
									counterparty={counterparty} number={number} 
									loading={loading} accountTypeAnotherUser={accountTypeAnotherUser} 
									accountTypeBetweenAcc={accountTypeBetweenAcc} enabledAccounts={enabledAccounts} 
									onChange={this.onChange} onSubmit={this.onSubmit}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		username: state.authReducer.username,
		accounts: state.accountReducer.accounts,
		lastUpdated: state.accountReducer.lastUpdated
	};
}

NewTransactionPage.propTypes = {
	lastUpdated: PropTypes.number,
	getAccounts: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
	createTransaction: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	username: PropTypes.string.isRequired,
	accounts: PropTypes.array.isRequired,
	getTransactions: PropTypes.func.isRequired,
	generateTransactions: PropTypes.func.isRequired
};

export default connect(mapStateToProps, {generateTransactions, createTransaction, getAccounts, getTransactions})(NewTransactionPage);