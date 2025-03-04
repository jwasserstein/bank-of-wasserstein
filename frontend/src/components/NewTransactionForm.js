import React from 'react';
import Button from './Button';
import PropTypes from 'prop-types';
import './NewTransactionForm.css';

const NewTransactionForm = ({onSubmit, transactionType, amount, 
                            onChange, counterparty, accountTypeAnotherUser, 
                            accountTypeBetweenAcc, enabledAccounts, number, loading}) => {
    return (
        <form className='NewTransactionForm-form' onSubmit={onSubmit}>
            {['Deposit', 'Withdrawal', 'Transfer to another user', 'Transfer between my accounts'].includes(transactionType) && ([
                <label key='label' htmlFor='amount'>Amount:</label>,
                <input key='input' type='number' className='NewTransactionForm-field' name='amount' 
                        id='amount' placeholder='Amount' min='0.01' step='0.01' value={amount} 
                        onChange={onChange} autoComplete='off' autoCorrect='off' autoCapitalize='none' required />
            ])}

            {['Transfer to another user'].includes(transactionType) && ([
                <label key='label-counterparty' htmlFor='counterparty'>Counterparty:</label>,
                <input key='input-counterparty' type='text' className='NewTransactionForm-field' name='counterparty' 
                        id='counterparty' placeholder='Counterparty' value={counterparty} 
                        onChange={onChange} autoComplete='off' autoCorrect='off' autoCapitalize='none' required />
            ])}
            {['Transfer to another user'].includes(transactionType) && ([
                <label key='label-accountType' htmlFor='accountTypeAnotherUser'>Account Type:</label>,
                <div className='NewTransactionForm-radio-container' key='radio-container'>
                    <div>
                        <input type='radio' id='Checking' className='NewTransactionForm-radio' value='Checking' name='accountTypeAnotherUser' 
                            onChange={onChange} checked={accountTypeAnotherUser === 'Checking'} />
                        <label htmlFor='Checking'>Checking</label>
                    </div>
                    <div>
                        <input type='radio' id='Savings' className='NewTransactionForm-radio' value='Savings' name='accountTypeAnotherUser' 
                            onChange={onChange} checked={accountTypeAnotherUser === 'Savings'} />
                        <label htmlFor='Savings'>Savings</label>
                    </div>
                    <div>
                        <input type='radio' id='Investing' className='NewTransactionForm-radio' value='Investing' name='accountTypeAnotherUser' 
                            onChange={onChange} checked={accountTypeAnotherUser === 'Investing'} />
                        <label htmlFor='Investing'>Investing</label>
                    </div>
                </div>
            ])}
            {['Transfer between my accounts'].includes(transactionType) && ([
                <label key='label-accountType' htmlFor='accountTypeBetweenAcc'>Account Type:</label>,
                <div className='NewTransactionForm-radio-container' key='radio-container'>
                    <div>
                        <input type='radio' id='Checking' className='NewTransactionForm-radio' value='Checking' name='accountTypeBetweenAcc' 
                            onChange={onChange} checked={accountTypeBetweenAcc === 'Checking'} disabled={!enabledAccounts.includes('Checking')}/>

                        <label htmlFor='Checking' className={!enabledAccounts.includes('Checking') ? 'NewTransactionForm-disabled': ''}>Checking</label>
                    </div>
                    <div>
                        <input type='radio' id='Savings' className='NewTransactionForm-radio' value='Savings' name='accountTypeBetweenAcc' 
                            onChange={onChange} checked={accountTypeBetweenAcc === 'Savings'} disabled={!enabledAccounts.includes('Savings')}/>
                            
                        <label htmlFor='Savings' className={!enabledAccounts.includes('Savings') ? 'NewTransactionForm-disabled': ''}>Savings</label>
                    </div>
                    <div>
                        <input type='radio' id='Investing' className='NewTransactionForm-radio' value='Investing' name='accountTypeBetweenAcc' 
                            onChange={onChange} checked={accountTypeBetweenAcc === 'Investing'} disabled={!enabledAccounts.includes('Investing')}/>
                            
                        <label htmlFor='Investing' className={!enabledAccounts.includes('Investing') ? 'NewTransactionForm-disabled': ''}>Investing</label>
                    </div>
                </div>
            ])}

            {['Generate'].includes(transactionType) && ([
                <label key='label' htmlFor='number'>Number:</label>,
                <input key='input' type='number' className='NewTransactionForm-field' name='number' 
                        id='number' placeholder='Number' min='1' step='1' value={number} 
                        onChange={onChange} autoComplete='off' autoCorrect='off' autoCapitalize='none' required />
            ])}

            <Button form className='NewTransactionForm-form-btn'>
                {loading ? 'Loading...' : 'Create Transaction'}
            </Button>
        </form>
    );
}

NewTransactionForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    transactionType: PropTypes.string.isRequired, 
    amount: PropTypes.string.isRequired, 
    onChange: PropTypes.func.isRequired, 
    counterparty: PropTypes.string.isRequired, 
    accountTypeAnotherUser: PropTypes.string.isRequired, 
    accountTypeBetweenAcc: PropTypes.string.isRequired,
    enabledAccounts: PropTypes.array.isRequired, 
    number: PropTypes.string.isRequired, 
    loading: PropTypes.bool.isRequired
};

export default NewTransactionForm;