// Import the React library to enable JSX syntax and React features.
import React from 'react'
import ReactDOM from 'react-dom/client'
// Import the App component from the App.tsx file which is the root component of the React application.
import App from './App.tsx'

// Create a root for the React component tree using ReactDOM.createRoot, and render the App component within it.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />  // The App component is rendered inside the strict mode checks.
  </React.StrictMode>,
)
