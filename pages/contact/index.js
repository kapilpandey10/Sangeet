import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';
import { FaUser, FaEnvelope, FaPaperPlane, FaHeadset, FaLightbulb, FaUsers } from 'react-icons/fa';
import styles from './style/ContactUs.module.css';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');

  // Intersection Observer for Animations (SEO & UX Rule)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, { threshold: 0.1 });

    const scrollElements = document.querySelectorAll(`.${styles.scrollAnimated}`);
    scrollElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus('Please fill all fields.');
      setStatusType('error');
      return;
    }

    const { error } = await supabase.from('message').insert([{ name, email, message }]);

    if (error) {
      setStatus('Error submitting message. Please try again.');
      setStatusType('error');
    } else {
      setStatus('Message sent! Our team will get back to you shortly.');
      setStatusType('success');
      setName(''); setEmail(''); setMessage('');
    }
  };

  return (
    <div className={styles.contactUsContainer}>
      <Head>
        <title>Contact DynaBeat | Support & Feedback for Nepali Music</title>
        <meta name="description" content="Reach out to the DynaBeat team for support, feedback, or collaboration related to Nepali lyrics and radio." />
      </Head>

      {/* Hero Header Section */}
      <section className={`${styles.headerSection} ${styles.scrollAnimated}`}>
        <h1 className={styles.mainTitle}>Let’s <span>Connect.</span></h1>
        <p className={styles.introText}>
          Have a question about a song? Want to suggest a radio station? 
          Drop us a line and let's keep the beat going.
        </p>
      </section>

      <div className={styles.mainLayout}>
        {/* Contact Form Section */}
        <section className={`${styles.formSection} ${styles.scrollAnimated}`}>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?..."
                required
              ></textarea>
            </div>

            <button type="submit" className={styles.submitBtn}>
              <FaPaperPlane /> Send Message
            </button>
          </form>
          {status && <p className={`${styles.statusMessage} ${styles[statusType]}`}>{status}</p>}
        </section>

        {/* Info Cards Section */}
        <aside className={`${styles.infoSection} ${styles.scrollAnimated}`}>
          <div className={styles.infoCard}>
            <FaHeadset className={styles.cardIcon} />
            <h3>Direct Support</h3>
            <p>Need help with your account or a lyrics submission?</p>
          </div>
          <div className={styles.infoCard}>
            <FaLightbulb className={styles.cardIcon} />
            <h3>Suggestions</h3>
            <p>Tell us how we can make DynaBeat better for the community.</p>
          </div>
        </aside>
      </div>

      {/* Modern Team Section */}
      <section className={`${styles.teamSection} ${styles.scrollAnimated}`}>
        <h2 className={styles.sectionTitle}><FaUsers /> The Minds Behind the Beat</h2>
        <div className={styles.teamMembers}>
          <div className={styles.teamMember}>
            <div className={styles.photoWrapper}>
                <img src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/382605956_1964574237256792_7040482525584229765_n.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZV91cmwgZ2VuZXJhdG9yLzM4MjYwNTk1Nl8xOTY0NTc0MjM3MjU2NzkyXzcwNDA0ODI1MjU1ODQyMjk3NjVfbi5qcGciLCJpYXQiOjE3Mjk0MDk3ODcsImV4cCI6Mjg4OTkzNDU4N30.EMSzi0nM-LolBZBhe00CrWddgh2CkINbiCp1YRXuakA&t=2024-10-20T07%3A36%3A27.667Z" alt="Kapil Pandey" />
            </div>
            <h3>Kapil Pandey</h3>
            <p className={styles.role}>Founder & CEO</p>
          </div>

          <div className={styles.teamMember}>
            <div className={styles.photoWrapper}>
                <img src="https://tffwhfvevgjscrhkdmpl.supabase.co/storage/v1/object/sign/Image_url%20generator/Screenshot%202024-09-19%20at%2010.20.06%20AM.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZV91cmwgZ2VuZXJhdG9yL1NjcmVlbnNob3QgMjAyNC0wOS0xOSBhdCAxMC4yMC4wNiBBTS5wbmciLCJpYXQiOjE3Mjk0MDk4NjUsImV4cCI6NzQwMzcyOTg2NX0.wWM5BwhESGOS3r--PgFXY0x4ohIJ6Rx8M5A_ZOegC7A&t=2024-10-20T07%3A37%3A45.592Z" alt="Asish Khanal" />
            </div>
            <h3>Asish Khanal</h3>
            <p className={styles.role}>Lead Editor & Manager</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;