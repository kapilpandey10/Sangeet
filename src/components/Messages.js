import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../style/Messages.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, []);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
  };

  return (
    <div className="messages-container">
      <h2>Messages</h2>
      <div className="message-list">
        <ul>
          {messages.map((message) => (
            <li key={message.id} onClick={() => handleSelectMessage(message)}>
              <div className="message-profile">
                <p><strong>Name:</strong> {message.name}</p>
                <p><strong>Email:</strong> {message.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="message-content">
        {selectedMessage ? (
          <div>
            <h3>Message from {selectedMessage.name}</h3>
            <p>{selectedMessage.message}</p>
          </div>
        ) : (
          <p>Select a message to view its content</p>
        )}
      </div>
    </div>
  );
};

export default Messages;
