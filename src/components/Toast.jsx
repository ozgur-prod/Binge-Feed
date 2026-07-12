import { useEffect, useRef } from 'react';
import { XIcon } from './icons';
import './Toast.css';

export default function Toast({ message, type = 'error', duration = 3500, onClose }) {
  // Latest refs so the dismiss timer can use the current duration/onClose without
  // restarting every time the parent re-renders with a new onClose reference.
  const durationRef = useRef(duration);
  const onCloseRef = useRef(onClose);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => onCloseRef.current(), durationRef.current);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss"><XIcon size={15} /></button>
    </div>
  );
}
