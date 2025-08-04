import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

// 1. Load your env variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk publishable key')
}

// 2. Get root element and mount app
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Missing root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkLoaded>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkLoaded>
    </ClerkProvider>
  </React.StrictMode>
)
