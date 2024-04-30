// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Define a Solidity smart contract named TransactionLogger.
contract TransactionLogger {
    // Declare an event that logs the Ether transfer details. This event will record the sender's address,
    // the recipient's address, and the amount of Ether transferred. 'indexed' parameters help to filter
    // the events by these indexed parameters.
    event EtherTransfer(address indexed _from, address indexed _to, uint _value);

     // Define a public function 'sendEther' that sends Ether from the caller to another address.
        // 'external' means this function is part of the contract interface and can be called from other contracts
        // and transactions. 'payable' allows this function to receive Ether.
    function sendEther(address payable _to) external payable {

        // The 'require' statement checks if the transaction contains Ether. If 'msg.value' (the amount of Ether sent)
        // is greater than 0, the function continues; otherwise, it reverts the transaction with the message "Send some ether".
        require(msg.value > 0, "Send some ether");

        // Transfers the Ether received (msg.value) to the address '_to'. This is a 'payable' address,
        // so it can receive Ether.
        _to.transfer(msg.value);
        
         // Emit an EtherTransfer event logging the details of the transaction including the sender (msg.sender),
        // the recipient (_to), and the amount of Ether transferred (msg.value).
        emit EtherTransfer(msg.sender, _to, msg.value);
    }
}
