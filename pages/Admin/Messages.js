// Messages.jsx — Premium Redesign
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ConfirmMsg from '../../components/ConfirmMsg';
import { FaEnvelope, FaTrashAlt, FaInbox } from 'react-icons/fa';
import styles from './style/Messages.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setMessages(data || []);
    };
    fetch();
  }, []);

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.viewed) {
      await supabase.from('message').update({ viewed: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, viewed: true } : m));
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('message').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setShowConfirm(false);
    setToDelete(null);
  };

  const unreadCount = messages.filter(m => !m.viewed).length;

  const initials = (name) => name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>

        {/* ── Inbox list ── */}
        <aside className={styles.inbox}>
          <div className={styles.inboxHeader}>
            <FaInbox />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} new</span>
            )}
          </div>
          <div className={styles.messageList}>
            {messages.length === 0 ? (
              <p className={styles.emptyInbox}>No messages yet</p>
            ) : messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  styles.messageRow,
                  selected?.id === msg.id ? styles.messageRowActive : '',
                  !msg.viewed ? styles.messageRowUnread : '',
                ].join(' ')}
                onClick={() => handleSelect(msg)}
              >
                <div className={styles.avatar}>{initials(msg.name)}</div>
                <div className={styles.msgMeta}>
                  <p className={styles.msgName}>{msg.name}</p>
                  <p className={styles.msgEmail}>{msg.email}</p>
                  <p className={styles.msgPreview}>{msg.message?.slice(0, 60)}…</p>
                </div>
                <div className={styles.msgRight}>
                  {!msg.viewed && <span className={styles.newDot} />}
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); setToDelete(msg); setShowConfirm(true); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Message Content ── */}
        <div className={styles.content}>
          {selected ? (
            <div className={styles.contentInner}>
              <div className={styles.msgHeader}>
                <div className={styles.msgFrom}>
                  <div className={styles.avatarLg}>{initials(selected.name)}</div>
                  <div>
                    <p className={styles.senderName}>{selected.name}</p>
                    <p className={styles.senderEmail}>{selected.email}</p>
                  </div>
                </div>
                <div className={styles.msgMeta2}>
                  <span className={styles.msgTimestamp}>
                    {new Date(selected.created_at).toLocaleString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <button
                    className={styles.deleteMsgBtn}
                    onClick={() => { setToDelete(selected); setShowConfirm(true); }}
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
              <p className={styles.msgBody}>{selected.message}</p>
            </div>
          ) : (
            <div className={styles.emptyContent}>
              <FaEnvelope className={styles.emptyIcon} />
              <p>Select a message to read</p>
            </div>
          )}
        </div>

      </div>

      <ConfirmMsg
        show={showConfirm}
        onConfirm={() => handleDelete(toDelete?.id)}
        onCancel={() => { setShowConfirm(false); setToDelete(null); }}
        message={`Delete message from "${toDelete?.name}"?`}
      />
    </div>
  );
};

export default Messages;