import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createAccount} from '../store/actions/accounts';
import Message from '../components/Message';
import Button from '../components/Button';
import RadioContainer from '../components/RadioContainer';
import PropTypes from 'prop-types';
import './NewAccountPage.css';

class NewAccountPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            accountType: '',
            err: '',
            loading: false
        };
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e){
        this.setState({...this.state, [e.target.name]: e.target.value});
    }

    onSubmit(e){
        e.preventDefault();
        this.setState({...this.state, loading: true});
        this.props.createAccount(this.state.accountType)
            .then(() => {
                this.setState({...this.state, loading: false, err: ''});
                this.props.history.push('/accounts');
            })
            .catch(err => {
                this.setState({...this.state, loading: false, err: err.message});
            });
    }

    render(){
        const {accounts} = this.props;
        const {accountType, err, loading} = this.state;

        const existingAccounts = accounts.map(a => a.type);
        const radios = [
            {label: 'Checking', checked: accountType === 'Checking', disabled: existingAccounts.includes('Checking')},
            {label: 'Savings', checked: accountType === 'Savings', disabled: existingAccounts.includes('Savings')},
            {label: 'Investing', checked: accountType === 'Investing', disabled: existingAccounts.includes('Investing')},
        ];

        return (
            <div>
                <h2 className='NewAccountPage-message'>Select an account type.</h2>
                {err && (
                    <Message>
                        {err}
                    </Message>
                )}
                <form className='NewAccountForm-form' onSubmit={this.onSubmit}>
                    <RadioContainer radios={radios} name='accountType' onChange={this.onChange} />
                    <Button form className='NewAccountForm-form-btn'>
                        {loading ? 'Loading...' : 'Create Account'}
                    </Button>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state){
    return {
        accounts: state.accountReducer.accounts
    };
}

NewAccountPage.propTypes = {
    accounts: PropTypes.array.isRequired,
    createAccount: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
};

export default connect(mapStateToProps, {createAccount})(NewAccountPage);