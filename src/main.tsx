import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/app.css';
import ThemeProvider from '@asafarim/react-themes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="auto" persistMode={true}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
