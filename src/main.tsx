import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope)
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
