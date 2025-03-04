import React from 'react';
import './Hero.css';

const Hero = () => (
    <div className="Hero-main-container">
        <div className="Hero-main-text">
            <h2>Banking Reimagined.</h2>
            <p>Start saving for the future of your dreams.</p>
        </div>
        <img className="Hero-coins-growing" src={'https://bank-of-wasserstein.s3.amazonaws.com/coins-growing.jpeg'} alt="coins growing" />
    </div>
);

export default Hero;