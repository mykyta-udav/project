import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext.tsx'

// test utilities for development
if (import.meta.env.DEV) {
  import('./utils/testLocalReservations');
}

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ReduxProvider>
  </React.StrictMode>,
)
