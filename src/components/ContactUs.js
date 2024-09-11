import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/ContactUs.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('message')
      .insert([{ name, email, message }]);

    if (error) {
      console.error('Error submitting message:', error);
      setStatus('Error submitting your message. Please try again later.');
    } else {
      setStatus('Your message has been sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="contact-us-container">
      <h1>Contact Us</h1>
      <p>If you have any questions, feedback, or need support, feel free to reach out to the Sangeet Lyrics Central team using the form below. We are here to help you with any queries related to Nepali songs and lyrics.</p>
      <form onSubmit={handleSubmit}>
  <label htmlFor="name">Name:</label>
  <input
    type="text"
    id="name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter your full name"
    required
  />

  <label htmlFor="email">Email:</label>
  <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email address"
    required
  />

  <label htmlFor="message">Message:</label>
  <textarea
    id="message"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Write your message here"
    required
  ></textarea>

  <button type="submit">Send Message</button>
</form>

      {status && <p>{status}</p>}
    </div>
  );
};

export default ContactUs;
