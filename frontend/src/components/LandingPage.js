import React from 'react';
import Hero from './Hero';
import Feature from './Feature';
import Button from './Button';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div>
            <main className='LandingPage-main'>
                <Hero />
            </main>
            <section className="LandingPage-secondary-container" key='LandingPage-secondary-container'>
                <Feature title='Make Deposits.' description='Deposit your spare cash with our easy-to-use system.' img={'https://bank-of-wasserstein.s3.amazonaws.com/piggybank.jpeg'} alt='piggy bank' />
                <Feature title='Make Withdrawals.' description='Access your cash when you need it, from the convenience of your laptop.' img={'https://bank-of-wasserstein.s3.amazonaws.com/atm.jpeg'}  alt='atm' />
                <Feature title='Make Transfers.' description='Transfer money to your friends with the click of a button.' img={'https://bank-of-wasserstein.s3.amazonaws.com/money.jpeg'} alt='money and pen' />
                <div className="LandingPage-join">
                    <h3>Join Today!</h3>
                    <Button to="/signup">Sign Up</Button>
                </div>
            </section>
            <footer className='LandingPage-footer'>
                Copyright © 2021, Justin Wasserstein
            </footer>
        </div>
        );
};

export default LandingPage;