// Import required modules and libraries
const express = require("express");  // Express framework for building web applications
const http = require("http");  // HTTP module for creating an HTTP server
const { Server } = require("socket.io");  // Socket.IO for real-time bidirectional event-based communication
const { Web3 } = require("web3");  // Web3 for interacting with the Ethereum blockchain
const WebsocketProvider = require("web3-providers-ws");  // WebSocket provider for web3
const contractABI = require("../build/contracts/TransactionLogger.json");  // ABI for the smart contract
const contractAddress = "0x1dE0aB01CCe1784f9864660f102c0470F75356aD";  // The deployed contract's address
require("dotenv").config({ path: "../.env" });   // dotenv for loading environment variables from a .env file    
const HDWalletProvider = require("@truffle/hdwallet-provider");  // HDWalletProvider for connecting to Ethereum through Infura with an account

// Initialize the Express application
const app = express();
app.use(express.json());  // Middleware for parsing JSON requests
const server = http.createServer(app);  // Create an HTTP server using Express
const io = new Server(server, {  // Set up Socket.IO on the server
  cors: {
    origin: "http://localhost:5173",  // Allow cross-origin requests from this address
    methods: ["GET", "POST"],  // Supported methods for cross-origin requests
  },
});

// Middleware for setting HTTP response headers to handle CORS issues
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Allowed origin for CORS
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");  // Allowed methods for CORS
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");  // Allowed headers for CORS
  next();
});

// Get environment variables for connecting to Ethereum network
const mnemonic = process.env.MNEMONIC;  // Mnemonic for the Ethereum account
const infuraProjectId = process.env.INFURA_PROJECT_ID;  // Infura project ID

// Construct the Infura URL for Ethereum network access
const infuraUrl = `https://sepolia.infura.io/v3/${infuraProjectId}`;

// Initialize the HDWalletProvider with the mnemonic and Infura URL
const provider = new HDWalletProvider(mnemonic, infuraUrl);
const web3 = new Web3(provider);  // Initialize web3 with the provided wallet

// Create a contract instance using ABI and contract address
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Create a contract instance using ABI and contract address
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Listen for 'EtherTransfer' events on the smart contract
contract.events.EtherTransfer({ fromBlock: "latest" }, (error, event) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(event);
  io.emit("EtherTransfer", event);  // Emit event data to connected Socket.IO clients
});

// Handle a new connection event from Socket.IO clients
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {  // Handle disconnection event
    console.log("user disconnected");
  });
});

// Define a POST route for sending Ether using the smart contract
app.post("/sendEther", async (req, res) => {
  const { recipient, amount } = req.body;   // Extract recipient and amount from request body
  try {
    const fromAccount = (await web3.eth.getAccounts())[0];  // Get the first account from the wallet
    // Execute 'sendEther' method on the smart contract
    const tx = await contract.methods.sendEther(recipient).send({
      from: fromAccount,
      value: web3.utils.toWei(amount, "ether"),  // Convert amount to Wei
      gas: 2000000,  // Set gas limit
    });

    // Get transaction receipt and details
    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
    const transaction = await web3.eth.getTransaction(tx.transactionHash);
    // Calculate gas cost
    const gasCost = web3.utils.fromWei(
      (receipt.gasUsed * transaction.gasPrice).toString(),
      "ether"
    );

    // Respond with transaction details
    res.json({
      success: true,
      txHash: tx.transactionHash,
      recipient: recipient,
      amount: amount,
      gasUsed: receipt.gasUsed.toString(),
      gasCost: gasCost.toString(),
    });
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ success: false, message: "Transaction failed" });  // Handle transaction error
  }
});

// Define the port and start listening for requests
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
