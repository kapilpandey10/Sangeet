import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../style/ViewCard.css'; // Assuming you have a CSS file for styling
import { FaCopy, FaShareAlt } from 'react-icons/fa'; // Icons for copy and share

const ViewCard = () => {
    const { recipient } = useParams(); // Get recipient from URL params
    const [card, setCard] = useState(null); // State to hold card details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        const fetchCard = async () => {
            setLoading(true);
            setError('');

            const formattedReceiver = recipient.replace('-', ' '); // Replace dash with space

            // Fetch the card based on the recipient's name
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .ilike('receiver', `%${formattedReceiver.toLowerCase()}%`) // Case-insensitive matching
                .single();

            if (error || !data) {
                setError('Card not found or an error occurred.');
                console.error('Error fetching card:', error);
            } else {
                setCard(data); // Set the card data
            }

            setLoading(false);
        };

        fetchCard();
    }, [recipient]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopySuccess('Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 3000); // Remove success message after 3 seconds
        }, () => {
            setCopySuccess('Failed to copy.');
        });
    };

    const shareCard = () => {
        if (navigator.share) {
            navigator.share({
                title: card.title,
                text: `Check out this card from ${card.sender}`,
                url: window.location.href,
            }).catch((error) => {
                console.error('Error sharing:', error);
            });
        } else {
            setCopySuccess('Sharing not supported on this device.');
        }
    };

    // Dynamic background based on time of day (day/night)
    const getDynamicBackground = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            return 'day-background'; // Apply day background
        } else {
            return 'night-background'; // Apply night background
        }
    };

    if (loading) {
        return (
            <div className="view-card-container">
                <div className="loading-placeholder">
                    <div className="placeholder-title"></div>
                    <div className="placeholder-meta"></div>
                    <div className="placeholder-message"></div>
                </div>
            </div>
        );
    }

    if (error) return <div className="view-card-container error">{error}</div>;

    return (
        <div className={`view-card-container ${getDynamicBackground()}`}>
            {card ? (
                <div className="card-content animated fadeIn">
                    <h1>{card.title}</h1>
                    <p className="meta">
                        <strong>From:</strong> {card.sender} <br />
                        <strong>To:</strong> {card.receiver}
                    </p>
                    <div className="message-box">
                        <p className="message">{card.message}</p>
                    </div>
                    <p className="timestamp">Sent on: {new Date(card.created_at).toLocaleString()}</p>

                    <div className="interactive-buttons">
                        <button onClick={copyToClipboard} className="copy-button">
                            <FaCopy /> Copy Link
                        </button>
                        <button onClick={shareCard} className="share-button">
                            <FaShareAlt /> Share
                        </button>
                    </div>

                    {copySuccess && <p className="toast-message">{copySuccess}</p>}
                </div>
            ) : (
                <div className="error">Card not found.</div>
            )}
        </div>
    );
};

export default ViewCard;
