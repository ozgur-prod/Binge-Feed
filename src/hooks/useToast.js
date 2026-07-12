import { createContext, useContext } from 'react';

export const ToastContext = createContext(() => {});

// use like: const toast = useToast() then toast('message') to show a toast
export function useToast() {
  return useContext(ToastContext);
}
