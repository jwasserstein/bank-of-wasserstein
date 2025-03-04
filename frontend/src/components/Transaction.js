import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import './Transaction.css';

const Transaction = ({description, date, amount, accountBalance}) => (
    <div className='Transaction-transaction'>
        <div className='Transaction-container'>
            <div>
                <div className='Transaction-recipient'>
                    {description} 
                </div>
                <div className='Transaction-date'>
                    {dayjs(date).format('MM/DD/YYYY h:mmA')} 
                </div>
            </div>
            <div>
                <div className='Transaction-amount'>
                    ${amount.toFixed(2)}
                </div>
                <div className='Transaction-balance'>
                    ${accountBalance.toFixed(2)}
                </div>
            </div>
        </div>
    </div>
);

Transaction.propTypes = {
    description: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    accountBalance: PropTypes.number.isRequired
};

export default Transaction;