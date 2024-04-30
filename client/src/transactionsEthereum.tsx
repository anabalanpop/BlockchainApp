// Import necessary hooks and libraries.
import { useState, useEffect } from "react";
import Web3 from "web3";  // To interact with Ethereum networks.
import detectEthereumProvider from "@metamask/detect-provider";  // To detect Ethereum provider like MetaMask.
import io from "socket.io-client";  // To create a socket connection.
import TransactionLoggerABI from "../../build/contracts/TransactionLogger.json";  // Import ABI for interacting with the smart contract.
import axios from 'axios';  // To make HTTP requests.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';  // Component to include FontAwesome icons.   
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';  // Specific FontAwesome icon.   

// TypeScript interfaces for strong typing.
interface LogEntry {
  [key: string]: any;  // Allows any number of properties of any type.
}

// TypeScript interface for transaction info.
interface TransactionInfo {
  recipient: string;
  amount: string;
  gasUsed: any;
  gasCost: any;
  txHash: string;
}

// Smart contract address on the Ethereum blockchain.
const contractAddress = "0x1dE0aB01CCe1784f9864660f102c0470F75356aD"; 

function SendEther() {
  // State management with useState hooks.
  const [recipient, setRecipient] = useState<string>("");  // State for storing the recipient's address.
  const [amount, setAmount] = useState<string>("");  // State for storing the amount of ether to send.
  const [logs, setLogs] = useState<LogEntry[]>([]);  // State for storing logs.
  const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null);  // State for storing transaction information.
  const [walletConnected, setWalletConnected] = useState<boolean>(false);  // State to track wallet connection status.
  const [alertMessage, setAlertMessage] = useState("");  // State to store alert messages.
  const [showAlert, setShowAlert] = useState(false);  // State to show or hide alerts.
  const [isLoading, setIsLoading] = useState(false);  // State to show or hide loading indicator.


  // Display alert messages.
   const displayAlert = (message: string, success = false) => {
    setAlertMessage(message);  // Setting the alert message.
    setShowAlert(true);  // Making the alert visible.
    setTimeout(() => setShowAlert(false), 4000); // Hiding the alert after 4 seconds.
    if (success) setIsLoading(false);  // If the operation was successful, stop loading.
  };


  // Establish a socket connection to listen for Ether transfer events.
  useEffect(() => {
    const socket = io("http://localhost:3001");  // Connecting to a Socket.IO server.
    socket.on("EtherTransfer", (event: LogEntry) => {  // Listening for 'EtherTransfer' events.
      console.log("Ether Transfer Event:", event);  // Logging the event.
      setLogs((currentLogs) => [...currentLogs, event]);  // Adding the new event to the logs.
    });
    return () => {
      socket.off("EtherTransfer");  // Cleaning up by removing the event listener.
    };
  }, []);

  // Check if wallet is connected on component mount.
  useEffect(() => {
    const isConnected = localStorage.getItem('walletConnected') === 'true';  // Checking if the wallet was previously connected.
    setWalletConnected(isConnected);  // Setting the wallet connection status based on previous state.
  
    const checkWalletConnection = async () => {
      const provider: any = await detectEthereumProvider();  // Detecting the Ethereum provider (MetaMask).
      if (provider) {
        provider.on('accountsChanged', (accounts: string[]) => {  // Listening for account changes.
          if (accounts.length > 0) {  // If there are accounts available.
            const wasConnected = localStorage.getItem('walletConnected') === 'true';  // Checking previous connection status.
            if (wasConnected) {  // If was previously connected.
              setWalletConnected(true);  // Keep the wallet connected.
              localStorage.setItem('walletConnected', 'true');  // Storing the connection status.
            }
          } else {  // If no accounts are available.
            setWalletConnected(false);  // Set wallet as not connected.
            localStorage.setItem('walletConnected', 'false');   // Storing the connection status.
          }
        });
      }
    };
    checkWalletConnection();   // Checking the wallet connection on component mount.
  }, []);
  

  // Connect the wallet using MetaMask.
  const connectWallet = async () => {
    const provider: any = await detectEthereumProvider();  // Detecting the Ethereum provider (MetaMask).
    if (provider && provider.request) {  // If the provider exists and has a 'request' method.
      await provider.request({ method: 'eth_requestAccounts' });  // Requesting account access.
      setWalletConnected(true);  // Setting the wallet as connected.
      localStorage.setItem('walletConnected', 'true');  // Storing the connection status.
    }
  };
  
  // Disconnect the wallet.
  const disconnectWallet = () => {
    setWalletConnected(false);  // Setting the wallet as disconnected.
    window.localStorage.setItem('walletConnected', 'false');  // Storing the connection status.
  };
  
  // Function to send Ether using Web3 and MetaMask.
  useEffect(() => {
    const isConnected = window.localStorage.getItem('walletConnected') === 'true';  // Checking if the wallet is connected.
    setWalletConnected(isConnected);  // Setting the wallet connection status.
  }, []);

// Function to send Ether.
  async function sendEther() {
    if (!recipient || !amount) {  // If recipient or amount is not specified.
      displayAlert("All fields must be filled!");  // Display an alert.
      return;
    }


    setIsLoading(true);  // Starting the loading indicator.

    const provider:any = await detectEthereumProvider();  // Detecting the Ethereum provider (MetaMask).
    if (provider) {
      await provider.request({ method: "eth_requestAccounts" });  // Requesting account access.
      const web3 = new Web3(provider);  // Creating a Web3 instance.
      const transactionLoggerContract = new web3.eth.Contract(TransactionLoggerABI.abi, contractAddress);  // Creating a contract instance.
  
      const accounts = await web3.eth.getAccounts();  // Getting the accounts.
      const sendAmountInWei = web3.utils.toWei(amount, "ether");  // Converting the amount to Wei.
  
      try {
        const txReceipt = await transactionLoggerContract.methods.sendEther(recipient).send({
          from: accounts[0],
          value: sendAmountInWei,
        });  // Sending Ether and getting the transaction receipt.
        console.log("Transaction Receipt:", txReceipt);  // Logging the transaction receipt.
        displayAlert("Transaction successful!");  // Displaying a success alert.
        setIsLoading(false);  // Stopping the loading indicator.
      } catch (error) {
        console.error("Transaction Failed:", error);  // Logging the error.
        displayAlert("Transaction failed. Please try again.");  // Displaying a failure alert.
        setIsLoading(false);  // Stopping the loading indicator.
      }
    } else {
      console.error("Please install MetaMask!");  // Logging an error message.
      displayAlert("Please install MetaMask!");  // Displaying an alert to install MetaMask.
      setIsLoading(false);  // Stopping the loading indicator.
    }
  }

  // Send Ether through a backend service.
  const sendEtherThroughBackend = async () => {  // Function to send Ether through the backend.

    setIsLoading(true);  // Starting the loading indicator.

    try {
      const response = await axios.post('http://localhost:3001/sendEther', {
        recipient,
        amount,
      });  // Sending a POST request to the backend.
      console.log('Transaction success:', response.data);  // Logging the successful transaction.
      setTransactionInfo(response.data);  // Setting the transaction info.
      displayAlert("Transaction successful!");  // Displaying a success alert.
      setIsLoading(false);  // Stopping the loading indicator.
    } catch (error:any) {
      console.error('Transaction failed:', error.response);  // Logging the error.
      displayAlert("All fields must be filled or Transaction failed. Please try again.");  // Displaying a failure alert.
      setIsLoading(false);  // Stopping the loading indicator.
    }
  };

  // Utility to shorten the display of Ethereum transaction hashes.
  const shortenTxHash = (txHash:any) => {
    if (txHash.length > 10) {   // If the transaction hash is longer than 10 characters.
      return `${txHash.slice(0, 5)}...${txHash.slice(-5)}`;  // Return a shortened version.
    }
    return txHash;  // Otherwise, return the full transaction hash.
  }

  // Return the rendered component.
  return (
    <div className="relative">  {/* Relative positioning for the component. */}
    {/* Loading Overlay */}
    {isLoading && (  // If loading is true.
         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">  {/* Creating an overlay. */}
           <div className="shine">  {/* Adding a shine effect. */}
            <FontAwesomeIcon icon={faBitcoin} className="text-6xl text-yellow-400 spin-pulse border-2 border-yellow-300 rounded-full p-1 special" />  {/* Displaying a spinning Bitcoin icon. */}
          </div>
        </div>
    )}
    {showAlert && (  // If showAlert is true.
          <div className="fixed top-0 left-0 w-full bg-red-500 text-white py-4 px-4 flex items-center z-50 border-2 border-yellow-400" style={{minHeight: 'fit-content'}}>  {/* Creating an alert box. */}
          <div className="flex-grow text-center text-2xl">{alertMessage}</div>  {/* Displaying the alert message. */}
          <button onClick={() => setShowAlert(false)} className="text-6xl">×</button>  {/* Adding a close button. */}
        </div>
      )}
      <div className="flex flex-col justify-center min-h-screen gradient-background py-20">  {/* Setting the main content area. */}
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md mx-auto">  {/* Setting the content box. */}
            {!walletConnected ? (  // If the wallet is not connected.
              <div className="text-center py-6 bg-gray-500 rounded-xl">  {/* Showing the wallet connect button. */}
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg transform transition-all duration-150 hover:from-blue-700 hover:to-purple-800 hover:scale-105 active:scale-95"
              >
                Connect Your Wallet
              </button>
            </div>
            
            ) : (
              <>
                <div className="text-center py-2 mb-4 bg-green-100 rounded">  {/* Displaying the connected status. */}
                  Your wallet is connected
                  <button onClick={disconnectWallet} className="block w-full mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-700 transition duration-150 ease-in-out">  {/* Adding a disconnect button. */}
                    Disconnect Wallet
                  </button>
                </div>
                <h1 className="text-2xl font-semibold mb-4 text-center">Send Ether</h1>  {/* Title for the send Ether section. */}
                <div className="space-y-4">  {/* Container for the input fields. */}
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Recipient Address"
                    className="input w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="input w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={sendEtherThroughBackend} className="w-full px-4 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-700 transition duration-150 ease-in-out">  {/* Button to send Ether through the backend. */}
                    Send Ether Server 
                  </button>
                  <button onClick={sendEther} className="w-full px-4 py-2 orange text-white font-bold rounded transition duration-150 ease-in-out">  {/* Button to send Ether via MetaMask. */}
                    Send Ether via MetaMask
                  </button>
                </div>
                <div className="mt-6">  {/* Container for transaction logs. */}
                  {logs.map((log, index) => (  // Mapping through logs to display them.
                    <>
                    <h2 className="text-xl font-semibold mb-2 text-center">Transaction Logs:</h2>  {/* Heading for transaction logs. */}
                    <p key={index} className="text-gray-600 break-words">{JSON.stringify(log)}</p> {/* Displaying logs */}
                    </>
                  ))}
                </div>
      
                {transactionInfo && (  // If there is transaction information.
                  <div className="mt-4 p-4 bg-gray-200 rounded-lg text-center">  {/* Container for displaying transaction information. */}
                    <h2 className="text-xl font-semibold mb-2 text-center titleSpecial">TRANSACTION LOGS:</h2>  {/* Heading for transaction information. */}
                    <div>
                    <p><span className="font-bold">To address: </span> {shortenTxHash(transactionInfo.recipient)}</p>  {/* Displaying the recipient address. */}
                    <p><span className="font-bold">Total: </span> {transactionInfo.amount} ETH</p>  {/* Displaying the total amount sent. */}
                    <p><span className="font-bold">Tax(gas): </span> {transactionInfo.gasUsed} units</p>  {/* Displaying the gas used. */}
                    <p><span className="font-bold">Cost(gas): </span> {transactionInfo.gasCost} ETH</p> {/* Displaying the gas cost */}
                    <p><span className="font-bold">Hash: </span> {shortenTxHash(transactionInfo.txHash)}</p>  {/* Displaying the transaction hash. */}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
}

export default SendEther;




