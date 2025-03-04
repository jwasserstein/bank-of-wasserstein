import React from 'react';
import Button from './Button';
import PropTypes from 'prop-types';
import './Form.css';

const Form = ({fields, loading, onSubmit, onChange}) => {
    const fieldElements = fields.map(f => (
        <label htmlFor={f.name} key={f.name} className='Form-label'>
            {f.label}:
            <input type={f.type} className='Form-field' value={f.value} onChange={onChange} id={f.name} 
            name={f.name} placeholder={f.label} autoComplete='off' autoCorrect='off' autoCapitalize='none' required />
        </label>
    ));

    return (
        <form className='Form-form' onSubmit={onSubmit}>
            {fieldElements}      
            <Button form className='Form-btn'>
                {loading ? 'Loading...' : 'Submit'}
            </Button>
        </form>
        );
};

Form.propTypes = {
    fields: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Form;