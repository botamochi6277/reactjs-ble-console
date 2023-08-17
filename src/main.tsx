import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Helmet, HelmetProvider } from 'react-helmet-async'

import CssBaseline from '@mui/material/CssBaseline';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <title>BLE Console</title>
      </Helmet>
      {/* <ThemeProvider theme={theme}> */}
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
      {/* </ThemeProvider> */}
    </HelmetProvider>
  </React.StrictMode>
)
