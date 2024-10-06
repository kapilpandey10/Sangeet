// Greeting.js
import React from 'react';
import '../style/Greeting.css';

const Greeting = () => {
    return (
        <div className="greeting-container">
            <h1>Welcome to the Easy Wishes Tool</h1>
            <p>With this tool, you can create personalized wish or invitation cards and share them via a link. Make your greetings more interactive and thoughtful!</p>
            <p>Create your card with customized messages and designs, and send it to your loved ones with just a click.</p>
            <p><a href="/create-card">Get Started</a></p>
        </div>
    );
};

export default Greeting;
