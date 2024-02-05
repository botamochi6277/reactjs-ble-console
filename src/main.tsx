import React from 'react';
import ReactDOM from 'react-dom/client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';

import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* https://www.mochinoki-labo.com/github-pages-react-router-dom-v6-problem/ */}
        <Route path={import.meta.env.BASE_URL} element={
          <HelmetProvider>
            <Helmet>
              <title>BLE Web Console</title>
            </Helmet>
            <CssBaseline />
            <App />
          </HelmetProvider>
        } />
      </Routes></BrowserRouter>
  </React.StrictMode>
)
