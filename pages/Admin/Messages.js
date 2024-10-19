// pages/Admin/Messages.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConfirmMsg from '../../components/ConfirmMsg'; // Importing the confirmation modal
import styles from './style/Messages.module.css'; // Importing CSS module

// Access environment variables (using NEXT_PUBLIC_ prefix for Next.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); // Control confirmation modal visibility
  const [messageToDelete, setMessageToDelete] = useState(null); // Hold the message to delete

  // Fetch messages from Supabase on component load
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

  // Select message and mark as viewed if not already viewed
  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);

    if (!message.viewed) {
      const { error } = await supabase
        .from('message')
        .update({ viewed: true })
        .eq('id', message.id);

      if (error) {
        console.error('Error updating message status:', error);
      } else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === message.id ? { ...msg, viewed: true } : msg
          )
        );
      }
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    const { error } = await supabase
      .from('message')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    } else {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
      setSelectedMessage(null);
    }
    setShowConfirm(false);
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      handleDeleteMessage(messageToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setMessageToDelete(null);
  };

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messageList}>
        <ul>
          {messages.map((message) => (
            <li
              key={message.id}
              className={`${styles.messageItem} ${message.viewed ? '' : styles.newMessage}`}
              onClick={() => handleSelectMessage(message)}
            >
              <div className={styles.messageProfile}>
                <p><strong>{message.name}</strong></p>
                <p>{message.email}</p>
              </div>
              {!message.viewed && <span className={styles.newBadge}>New</span>}
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteClick(message)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.messageContent}>
        {selectedMessage ? (
          <div className={styles.messageBubble}>
            <div className={styles.messageHeader}>
              <h3>Message from {selectedMessage.name}</h3>
              <span className={styles.messageTimestamp}>{new Date(selectedMessage.created_at).toLocaleString()}</span>
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
