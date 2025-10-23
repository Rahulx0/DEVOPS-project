import React, { createContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
}

type ToastContextType = (message: string) => void;

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const ToastsStateContext = createContext<Toast[]>([]);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <ToastsStateContext.Provider value={toasts}>
        {children}
      </ToastsStateContext.Provider>
    </ToastContext.Provider>
  );
};