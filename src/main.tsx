import React from 'react';
import ReactDOM from 'react-dom/client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';

import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* https://www.mochinoki-labo.com/github-pages-react-router-dom-v6-problem/ */}
        <Route path="https://botamochi6277.github.io/reactjs-ble-console/" element={
          <HelmetProvider>
            <Helmet>
              <title>BLE Console</title>
            </Helmet>
            <CssBaseline />
            <App />
          </HelmetProvider>
        } />
      </Routes></BrowserRouter>
  </React.StrictMode>
)
