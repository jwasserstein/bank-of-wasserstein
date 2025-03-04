import React from 'react';
import PropTypes from 'prop-types';
import './Feature.css';

const Feature = ({title, description, img, alt}) => (
    <div className="Feature">
        <img className="Feature-image" src={img} alt={alt} />
        <div className="Feature-text">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    </div>
);

Feature.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired
};

export default Feature;