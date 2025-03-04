import React from 'react';
import PropTypes from 'prop-types';
import './Balance.css';

const Balance = ({accountBalance}) => {
	return (
		<div className="Balance">
            <strong>Balance</strong>: ${accountBalance.toFixed(2)}
        </div>
	);
}

Balance.propTypes = {
	accountBalance: PropTypes.number.isRequired
};

export default Balance;