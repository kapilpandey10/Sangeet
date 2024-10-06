import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../style/CreateCard.css';
import Modal from 'react-modal'; // Import react-modal
import { FaCopy, FaCheckCircle } from 'react-icons/fa'; // Icons for copy functionality and success indicator
import { PulseLoader } from 'react-spinners'; // Spinner for loading indicator

// Set app element for accessibility
Modal.setAppElement('#root');

const CreateCard = () => {
    const [sender, setSender] = useState('');
    const [receiver, setReceiver] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [cardLink, setCardLink] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Generate card URL based on receiver's name (first-last format)
        const formattedReceiver = receiver.toLowerCase().replace(/\s/g, '-');

        try {
            // Insert data into Supabase table
            const { data, error } = await supabase
                .from('cards')
                .insert([
                    {
                        sender,
                        receiver,
                        title,
                        message,
                        created_at: new Date(),
                    }
                ]);

            if (error) throw error;

            // Generate the card link and show it
            const cardUrl = `/cards/${formattedReceiver}`;
            setCardLink(cardUrl);

            // Automatically copy to clipboard
            navigator.clipboard.writeText(window.location.origin + cardUrl).then(() => {
                setModalIsOpen(true); // Open modal after successful copy
            }, () => {
                setError('Failed to copy the link.');
            });

            console.log('Card successfully created:', data);
        } catch (error) {
            setError('Failed to create the card. Please try again.');
            console.error('Error creating card:', error);
        } finally {
            setLoading(false); // Stop loading once done
        }
    };

    const closeModal = () => {
        setModalIsOpen(false); // Close the modal
    };

    return (
        <div className="create-card-container">
            <h2>Create a New Card</h2>
            <form onSubmit={handleSubmit} className={loading ? 'loading' : ''}>
                <label>Sender Name:</label>
                <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    required
                    disabled={loading} 
                />

                <label>Receiver Name:</label>
                <input
                    type="text"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    required
                    disabled={loading} 
                />

                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading} 
                />

                <label>Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={loading} 
                />

                <button type="submit" disabled={loading}>
                    {loading ? <PulseLoader size={10} color="#fff" /> : 'Create Card'}
                </button>

                {error && <p className="error">{error}</p>}
            </form>

            {/* Modal for displaying card link */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Card Link Modal"
                className="modal"
                overlayClassName="modal-overlay"
            >
                <div className="modal-content">
                    <FaCheckCircle className="success-icon" />
                    <h2>Card Created Successfully!</h2>
                    <p>Your card link has been copied to the clipboard:</p>
                    <div className="card-link">
                        <a href={cardLink} target="_blank" rel="noopener noreferrer">
                            {window.location.origin + cardLink}
                        </a>
                    </div>
                    <button onClick={closeModal} className="close-modal-button">
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default CreateCard;
