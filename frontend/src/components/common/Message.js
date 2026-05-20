import React from 'react';

/**
 * Reusable message/alert component
 */
const Message = ({ variant = 'info', children, onClose }) => {
  const variants = {
    success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
    error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
    warning: { bg: '#fff3cd', color: '#856404', border: '#ffeeba' },
    info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
  };

  const style = variants[variant] || variants.info;

  return (
    <div
      className="message"
      style={{
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '8px',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Message;