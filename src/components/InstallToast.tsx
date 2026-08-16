import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/install-toast.css'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallToast() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      console.log('Toast already dismissed')
      return
    }

    // Check if already installed
    const isInstalled = localStorage.getItem('pwa-installed')
    if (isInstalled) {
      console.log('App already installed')
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      console.log('Install prompt detected')
      // Show toast after a short delay
      setTimeout(() => setShowToast(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // For testing: show toast after 5 seconds if no install prompt detected
    const testTimeout = setTimeout(() => {
      if (!deferredPrompt) {
        console.log('Testing mode: showing toast without install prompt')
        setShowToast(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(testTimeout)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true')
    }

    setDeferredPrompt(null)
    setShowToast(false)
  }

  const handleDismiss = () => {
    setShowToast(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          className="install-toast"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="install-toast__content">
            <div className="install-toast__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="install-toast__text">
              <p className="install-toast__title">Install Our App</p>
              <p className="install-toast__description">Get the full experience on your device</p>
            </div>
            <button
              className="install-toast__install"
              onClick={handleInstall}
            >
              Install
            </button>
            <button
              className="install-toast__dismiss"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
