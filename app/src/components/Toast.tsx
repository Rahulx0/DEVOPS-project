import React, { useContext } from 'react';
import { ToastsStateContext } from '../context/ToastContext';

const Toast: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="bg-primary text-white font-semibold py-3 px-6 rounded-md shadow-lg animate-fade-in-up">
      {message}
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useContext(ToastsStateContext);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} />
      ))}
    </div>
  );
};

export default ToastContainer;