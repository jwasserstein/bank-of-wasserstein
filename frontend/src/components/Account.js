import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import './Account.css';

const Account = ({link, type, accountBalance}) => (
    <Link className='Account-account' to={link}>
        <div className='Account-container'>
            <div className='Account-type'>
                {type} Account
            </div>
            <div className='Account-balance'>
                ${accountBalance.toFixed(2)}
            </div>
        </div>
    </Link>
);

Account.propTypes = {
    link: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    accountBalance: PropTypes.number.isRequired
};

export default Account;