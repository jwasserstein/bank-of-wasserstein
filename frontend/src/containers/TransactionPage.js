import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getTransactions} from '../store/actions/transactions';
import {deleteAccount} from '../store/actions/accounts';
import Button from '../components/Button';
import Balance from '../components/Balance';
import ItemList from '../components/ItemList';
import Transaction from '../components/Transaction';
import PropTypes from 'prop-types';
import './TransactionPage.css';

class TransactionPage extends Component {
	constructor(props){
		super(props);
		this.closeAccount = this.closeAccount.bind(this);
	}

	componentDidMount(){
		const accountId = this.props.match.params.accountId;
		if(!this.props.transactionReducer[accountId]?.lastUpdated){
			this.props.getTransactions(accountId);
		}
	}

	closeAccount(e){
		e.preventDefault();
		this.props.deleteAccount(this.props.match.params.accountId)
			.then(() => this.props.history.push('/accounts'));
	}
	
	render(){
		const {match, transactionReducer, accounts} = this.props;

		const accountId = match.params.accountId;
		if(!transactionReducer[accountId]){
			return <div></div>;
		}
		
		const transactions = transactionReducer[accountId].transactions;
		const accountType = accounts.find(a => a._id === accountId)?.type;

		return (
			<div>
				<h2 className='TransactionPage-message'>Review your transactions.</h2>
				<p className='TransactionPage-account-type'>{accountType} Account</p>
				<div className='TransactionPage-btn-container'>
					<Button to={`/accounts/${accountId}/transactions/new`}>New Transaction</Button>
					<Balance accountBalance={transactions[0] ? transactions[0].accountBalance : 0} />
				</div>
				<ItemList items={transactions} ItemComponent={Transaction} itemName='transactions' itemProps={{
					date: 'date',
					description: 'description',
					amount: 'amount',
					accountBalance: 'accountBalance',
					key: 'transactionNumber'
				}} />
				<h2 className='TransactionPage-message'>Close your account.</h2>
                <form className='TransactionPage-close-account-container'>
                    <Button className='TransactionPage-close-btn' onClick={this.closeAccount} form>Close {accountType} Account</Button>
                </form>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		transactionReducer: state.transactionReducer,
		accounts: state.accountReducer.accounts,
	};
}

TransactionPage.propTypes = {
	transactionReducer: PropTypes.object.isRequired,
	accounts: PropTypes.array.isRequired,
	getTransactions: PropTypes.func.isRequired,
	deleteAccount: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default connect(mapStateToProps, {getTransactions, deleteAccount})(TransactionPage);