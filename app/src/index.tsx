// Entry point for React application
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root DOM element to mount the React app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create React root and render the App component
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// CI: pipeline test 2025-11-20
