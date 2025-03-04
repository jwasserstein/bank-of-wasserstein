import React from 'react';
import PropTypes from 'prop-types';
import './Message.css';

const Message = ({color, children}) => {
    const colorClass = 'Message-' + (color || 'red');
    return (
        <div className={'Message ' + colorClass}>{children}</div>
    );
};

Message.propTypes = {
    color: PropTypes.string,
    children: PropTypes.any
};

export default Message;