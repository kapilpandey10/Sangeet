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

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);

    // If the message hasn't been viewed, mark it as viewed in the database
    if (!message.viewed) {
      const { error } = await supabase
        .from('message')
        .update({ viewed: true })
        .eq('id', message.id);

      if (error) {
        console.error('Error updating message status:', error);
      } else {
        // Update the state to reflect the message as viewed
        const updatedMessages = messages.map((msg) =>
          msg.id === message.id ? { ...msg, viewed: true } : msg
        );
        setMessages(updatedMessages);
      }
    }
  };

  return (
    <div className="messages-container">
      <h2>Messages</h2>
      <div className="message-list">
        <ul>
          {messages.map((message) => (
            <li
              key={message.id}
              className={`message-item ${message.viewed ? '' : 'new-message'}`}
              onClick={() => handleSelectMessage(message)}
            >
              <div className="message-profile">
                <p><strong>Name:</strong> {message.name}</p>
                <p><strong>Email:</strong> {message.email}</p>
              </div>
              {!message.viewed && <span className="new-badge">New</span>}
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
