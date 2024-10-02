import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/ContactUs.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
<link rel="canonical" href="https://pandeykapil.com.np/contactus" />

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

      {/* Contact Form */}
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

      {/* Authors Section */}
      <div className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-members">

          {/* Kapil Pandey - Admin & CEO */}
          <div className="team-member">
            <img src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/382605956_1964574237256792_7040482525584229765_n.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZV91cmwgZ2VuZXJhdG9yLzM4MjYwNTk1Nl8xOTY0NTc0MjM3MjU2NzkyXzcwNDA0ODI1MjU1ODQyMjk3NjVfbi5qcGciLCJpYXQiOjE3MjY3MDUzMjgsImV4cCI6MjE5NjQ1MjI5Mjh9.veBfA1KTcvJDgmVlbMBhEQmyZVnK4y6IpwbarglhdWw&t=2024-09-19T00%3A22%3A08.405Z" alt="Kapil Pandey" className="team-photo" />
            <h3>Kapil Pandey</h3>
            <p>Role: Admin, CEO</p>
          </div>

          {/* Asish Khanal - Editor & Manager */}
          <div className="team-member">
            <img src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/Screenshot%202024-09-19%20at%2010.20.06%20AM.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZV91cmwgZ2VuZXJhdG9yL1NjcmVlbnNob3QgMjAyNC0wOS0xOSBhdCAxMC4yMC4wNiBBTS5wbmciLCJpYXQiOjE3MjY3MDUyMzcsImV4cCI6MzY3NTY0NTIyODM3fQ.w2QnbU9ErJqgDvsJtiWHVnMD4mVN-BzfMFWdoHsGKn8&t=2024-09-19T00%3A20%3A37.462Z" alt="Asish Khanal" className="team-photo" />
            <h3>Asish Khanal</h3>
            <p>Role: Editor, Manager</p>
          </div>

        </div>
      </div>

      {/* Include the HotNews component */}
    </div>
  );
};

export default ContactUs;
