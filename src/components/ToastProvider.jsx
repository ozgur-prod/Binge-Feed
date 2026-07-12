import { useCallback, useState } from 'react';
import Toast from './Toast';
import { ToastContext } from '../hooks/useToast';

// renders the toast, so any component can show one via useToast()
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // key resets the dismiss timer even when the same message fires twice in a row
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </ToastContext.Provider>
  );
}
