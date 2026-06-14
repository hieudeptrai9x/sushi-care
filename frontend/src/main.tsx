import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></BrowserRouter></StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`))
}
