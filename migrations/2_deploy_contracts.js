// Import the artifacts.require method from Truffle to require the smart contract.
// "TransactionLogger" is the name of the smart contract that I want to deploy.
const TransactionLogger = artifacts.require("TransactionLogger");

// Export a function that takes a deployer object as an argument.
// The deployer object is provided by Truffle and is used for deploying contracts to the blockchain.
module.exports = function(deployer) {
  // Use the deployer to deploy the TransactionLogger contract.
  // This function will take the compiled contract and deploy it to the network that my Truffle configuration is set up for.
  deployer.deploy(TransactionLogger);
};
