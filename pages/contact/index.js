import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './style/ContactUs.module.css'; // Use the CSS module

// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // For success/error styling

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setStatus('Please fill all fields.');
      setStatusType('error');
      return;
    }

    const { error } = await supabase
      .from('message')
      .insert([{ name, email, message }]);

    if (error) {
      setStatus('Error submitting your message. Please try again later.');
      setStatusType('error');
    } else {
      setStatus('Your message has been sent successfully!');
      setStatusType('success');
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className={styles.contactUsContainer}>
      <h1>Contact Us</h1>
      <p className={styles.introText}>
        If you have any questions, feedback, or need support, feel free to reach out to the DynaBeat team using the form below. We are here to help you with any queries related to Nepali songs and lyrics.
      </p>

      {/* Contact Form */}
      <form className={styles.contactForm} onSubmit={handleSubmit}>
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

      {status && <p className={`${styles.statusMessage} ${styles[statusType]}`}>{status}</p>}

      {/* Authors Section */}
      <div className={styles.teamSection}>
        <h2>Meet Our Team</h2>
        <div className={styles.teamMembers}>

          {/* Kapil Pandey - Admin & CEO */}
          <div className={styles.teamMember}>
            <img
              src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/382605956_1964574237256792_7040482525584229765_n.jpg?token=..."
              alt="Kapil Pandey"
              className={styles.teamPhoto}
            />
            <h3>Kapil Pandey</h3>
            <p>Role: Admin, CEO</p>
          </div>

          {/* Asish Khanal - Editor & Manager */}
          <div className={styles.teamMember}>
            <img
              src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/Screenshot%202024-09-19%20at%2010.20.06%20AM.png?token=..."
              alt="Asish Khanal"
              className={styles.teamPhoto}
            />
            <h3>Asish Khanal</h3>
            <p>Role: Editor, Manager</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
