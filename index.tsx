import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// No need to import GoogleGenAI here if it's directly imported and used in geminiService.ts
// import { GoogleGenAI } from "@google/genai"; // This line can be removed

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
