import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../style/CreateCard.css'; 
import Modal from 'react-modal';
import { FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaHeading, FaCheckCircle } from 'react-icons/fa'; // Added FaCheckCircle here
import { PulseLoader } from 'react-spinners'; 

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

    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formattedReceiver = receiver.toLowerCase().replace(/\s/g, '-');

        try {
            const { data, error } = await supabase
                .from('cards')
                .insert([
                    {
                        sender,
                        receiver,
                        title,
                        message_html: message,
                        created_at: new Date(),
                    }
                ]);

            if (error) throw error;

            const cardUrl = `/cards/${formattedReceiver}`;
            setCardLink(cardUrl);

            navigator.clipboard.writeText(window.location.origin + cardUrl).then(() => {
                setModalIsOpen(true);
            }, () => {
                setError('Failed to copy the link.');
            });

            console.log('Card successfully created:', data);
        } catch (error) {
            setError('Failed to create the card. Please try again.');
            console.error('Error creating card:', error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className="create-card-container">
            <h2>Create a New Card</h2>

            <form onSubmit={handleSubmit} className={loading ? 'loading' : ''}>
                {/* Sender Name */}
                <div className="input-group">
                    <label>Sender Name:</label>
                    <input
                        type="text"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {/* Receiver Name */}
                <div className="input-group">
                    <label>Receiver Name:</label>
                    <input
                        type="text"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {/* Title */}
                <div className="input-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {/* Formatting Toolbar */}
                <div className="toolbar">
                    <button type="button" onClick={() => formatText('bold')} title="Bold">
                        <FaBold />
                    </button>
                    <button type="button" onClick={() => formatText('italic')} title="Italic">
                        <FaItalic />
                    </button>
                    <button type="button" onClick={() => formatText('underline')} title="Underline">
                        <FaUnderline />
                    </button>
                    <button type="button" onClick={() => formatText('insertOrderedList')} title="Ordered List">
                        <FaListOl />
                    </button>
                    <button type="button" onClick={() => formatText('insertUnorderedList')} title="Unordered List">
                        <FaListUl />
                    </button>
                    <button type="button" onClick={() => formatText('formatBlock', 'H1')} title="Heading 1">
                        <FaHeading /> H1
                    </button>
                    <button type="button" onClick={() => formatText('formatBlock', 'H2')} title="Heading 2">
                        <FaHeading /> H2
                    </button>
                </div>

                {/* Message Area */}
                <div
                    className="editable-content"
                    contentEditable
                    onInput={(e) => setMessage(e.currentTarget.innerHTML)} 
                    placeholder="Type your message here... (You can format text)"
                ></div>

                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? <PulseLoader size={10} color="#fff" /> : 'Create Card'}
                </button>

                {error && <p className="error">{error}</p>}
            </form>

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
