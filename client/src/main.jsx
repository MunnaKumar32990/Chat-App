import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from "react-helmet-async";




import App from './App.jsx'
import {CssBaseline} from '@mui/material'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <App />
    <CssBaseline />
    </HelmetProvider>
  </StrictMode>,
)
