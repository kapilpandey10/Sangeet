import React, { useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Styles from './style/ConfirmMsg.module.css';

const ConfirmMsg = ({
  show,
  onConfirm,
  onCancel,
  message,
  confirmButtonText,
  cancelButtonText,
  variant = 'danger', // 'danger' | 'warning' | 'info'
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!show) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div
      className={Styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }} // click outside to dismiss
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className={`${Styles.modal} ${Styles[variant]}`}>

        <div className={Styles.iconWrap}>
          <FiAlertTriangle className={Styles.icon} />
        </div>

        <div className={Styles.body}>
          <h2 className={Styles.title} id="confirm-title">Are you sure?</h2>
          <p className={Styles.message}>{message}</p>
        </div>

        <div className={Styles.actions}>
          <button className={Styles.cancelBtn} onClick={onCancel}>
            {cancelButtonText || 'Cancel'}
          </button>
          <button className={`${Styles.confirmBtn} ${Styles[`confirmBtn_${variant}`]}`} onClick={onConfirm}>
            {confirmButtonText || 'Yes, Confirm'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmMsg;