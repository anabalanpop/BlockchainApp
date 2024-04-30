import Navigation from "./Navigation";  // Import the Navigation component from Navigation.js file
import SendEther from "./transactionsEthereum";   // Import the SendEther component from transactionsEthereum.js file

// Define the main App component which serves as the root component of the application
export default function App() {
  // Return statement rendering the Navigation and SendEther components
  return (
    <>
      <Navigation />  // Insert the Navigation component that likely contains the navigation bar for the app
      <SendEther />  // Insert the SendEther component that probably handles the functionality to send Ether
    </>
  )
}

