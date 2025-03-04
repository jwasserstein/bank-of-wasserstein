import React from 'react';
import './AboutPage.css';

const AboutPage = () => (
    <div>
        <div className='AboutPage-container'>
            <h2 className='AboutPage-title'>About BANK OF WASSERSTEIN</h2>
            <p>BANK OF WASSERSTEIN is a demonstration banking application that allows users to create 
                checking, savings, and investing accounts, submit deposits and withdrawals, and transfer 
                money to other users. It’s a single page, fullstack application that uses React and 
                Redux on the frontend and Node.js, Express, and MongoDB on the backend. The frontend is 
                served by GitHub Pages and the backend runs on Heroku with a managed database provided by 
                MongoDB Atlas. It was designed using Figma.</p>
            <p>Handcrafted with <span className='AboutPage-heart'>❤</span> in Glastonbury, Connecticut.</p>
            <div className='AboutPage-icon-container'>
                <a href='https://github.com/jwasserstein/bank-of-wasserstein-frontend' target='_blank' rel='noreferrer'>
                    <span className="iconify" data-icon="ant-design:github-filled" data-inline="false"></span>
                    <p>GitHub</p>
                    <p>frontend</p>
                </a>
                <a href='https://github.com/jwasserstein/bank-of-wasserstein-backend' target='_blank' rel='noreferrer'>
                    <span className="iconify" data-icon="ant-design:github-filled" data-inline="false"></span>
                    <p>GitHub</p>
                    <p>backend</p>
                </a>
                <a href='https://www.wasserstein.dev/' target='_blank' rel='noreferrer'>
                    <span className="iconify" data-icon="ant-design:folder-outlined" data-inline="false"></span>
                    <p>Portfolio</p>
                </a>
                <a href='https://www.linkedin.com/in/justin-wasserstein' target='_blank' rel='noreferrer'>
                    <span className="iconify" data-icon="ant-design:linkedin-filled" data-inline="false"></span>
                    <p>LinkedIn</p>
                </a>
                <a href='https://jwasserstein.s3.amazonaws.com/Resume-Wasserstein.pdf' target='_blank' rel='noreferrer'>
                    <span className="iconify" data-icon="fa-regular:clipboard" data-inline="false"></span>
                    <p>Resume</p>
                </a>
            </div>
        </div>
    </div>
);

export default AboutPage;