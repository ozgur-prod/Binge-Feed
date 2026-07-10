import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'error', duration = 3500, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">✕</button>
    </div>
  );
}
