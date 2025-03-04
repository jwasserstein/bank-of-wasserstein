import React, {Component} from 'react';
import {connect} from 'react-redux';
import Account from '../components/Account';
import Button from '../components/Button';
import Balance from '../components/Balance';
import ItemList from '../components/ItemList';
import {getAccounts} from '../store/actions/accounts';
import PropTypes from 'prop-types';
import './AccountsPage.css';

class AccountsPage extends Component {
    componentDidMount(){
        if(!this.props.lastUpdated){
            this.props.getAccounts();
        }
    }

    render() {
        const {accounts} = this.props;

        const totalBalance = accounts && accounts.reduce((acc, next) => acc + next.accountBalance, 0);
        const accountArray = accounts && accounts.map(a => ({...a, link: `/accounts/${a._id}`}));  //create a link property to make it easier to pass data to ItemList

        return (
            <div>
                <h2 className='AccountsPage-message'>Select an account.</h2>
                <div className="AccountsPage-btn-container">
                    <Button to='/accounts/new'>New Account</Button>
                    <Balance accountBalance={totalBalance} />
                </div>
                <ItemList items={accountArray} ItemComponent={Account} itemName='accounts' itemProps={{
                        type: 'type',
                        link: 'link',
                        accountBalance: 'accountBalance',
                        key: 'type'
                    }}/>
            </div>
        );
    }
}

function mapStateToProps(state){
    return {
        accounts: state.accountReducer.accounts,
        lastUpdated: state.accountReducer.lastUpdated
    };
}

AccountsPage.propTypes = {
    accounts: PropTypes.array,
    lastUpdated: PropTypes.number,
    getAccounts: PropTypes.func.isRequired
};

export default connect(mapStateToProps, {getAccounts})(AccountsPage);