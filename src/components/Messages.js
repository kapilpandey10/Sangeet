import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConfirmMsg from './ConfirmMsg'; // Importing the confirmation modal
import '../style/Messages.css';

// Access environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); // Control confirmation modal visibility
  const [messageToDelete, setMessageToDelete] = useState(null); // Hold the message to delete

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

  // Function to delete the selected message
  const handleDeleteMessage = async (messageId) => {
    const { error } = await supabase
      .from('message')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    } else {
      // Update the state to remove the deleted message
      setMessages(messages.filter((msg) => msg.id !== messageId));
      setSelectedMessage(null);
    }
    setShowConfirm(false); // Close the confirmation modal
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message); // Set the message to delete
    setShowConfirm(true); // Show the confirmation modal
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      handleDeleteMessage(messageToDelete.id); // Proceed with deletion
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false); // Close modal without deleting
    setMessageToDelete(null); // Reset message to delete
  };

  return (
    <div className="messages-container">
      <div className="message-list">
        <ul>
          {messages.map((message) => (
            <li
              key={message.id}
              className={`message-item ${message.viewed ? '' : 'new-message'}`}
              onClick={() => handleSelectMessage(message)}
            >
              <div className="message-profile">
                <p><strong>{message.name}</strong></p>
                <p>{message.email}</p>
              </div>
              {!message.viewed && <span className="new-badge">New</span>}
              {/* Delete button */}
              <button
                className="delete-button"
                onClick={() => handleDeleteClick(message)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="message-content">
        {selectedMessage ? (
          <div className="message-bubble">
            <div className="message-header">
              <h3>Message from {selectedMessage.name}</h3>
              <span className="message-timestamp">{new Date(selectedMessage.created_at).toLocaleString()}</span>
            </div>
            <p>{selectedMessage.message}</p>
          </div>
        ) : (
          <p>Select a message to view its content</p>
        )}
      </div>

      {/* ConfirmMsg modal */}
      <ConfirmMsg
        show={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Are you sure you want to delete this message?"
      />
    </div>
  );
};

export default Messages;
