Tokenization of Bank Deposits
Table of Contents
Prerequisites
Installation
Frontend Configuration
Running the Application on Localhost

**Prerequisites**
Before you begin, ensure that you have the following components installed on your system:

Visual Studio Code (VS Code): A free and powerful source code editor.

Download VS Code
Node.js and npm: Required to install additional extensions and tools.

Download Node.js
Tron-IDE: A tool for compiling and deploying smart contracts on Tron.

Download Tron-IDE
TronLink: A browser extension to interact with the Tron blockchain.

Chrome: Install TronLink for Chrome
Firefox: Install TronLink for Firefox
Edge: Install TronLink for Edge

**Installation**
Clone the Repository:

Clone this repository to your local machine using Git:

bash
Copiar código
git clone https://github.com/Lappsnet/XFY-TRON.git
Start Live Server:

In Visual Studio Code, open the index.html file.

Right-click in the editor and select "Open with Live Server".
Alternatively, click the "Go Live" button in the bottom right corner of VS Code.
This will open your dashboard in your default browser at a URL like http://127.0.0.1:5500/index.html.

**Connect the Tron Wallet:
**
In the dashboard, click the "Connect Wallet" button.
TronLink will request permission to connect. Accept the connection.
Once connected, your Tron address will be displayed in the corresponding section.

**Interact with the Application:
**
Check Balance: Verify your BKT balance in the designated section.
Make Deposits: Enter an amount in BKT and click "Deposit".
Withdraw Deposits: Click "Withdraw" to withdraw your funds with interest.
Register Merchants (if you are the owner): Enter the merchant's address to register or deregister.
Make Payments: Enter the merchant's address and the amount to execute a payment.
Transaction History: Review your transaction history in the corresponding section.

Running the Application on Localhost
Application Testing
Wallet Connection Test:

Ensure that when connecting TronLink, your address is correctly displayed on the dashboard.
Verify that the BKT balance updates according to your tokens.
Deposit Test:

Make a deposit of a specific amount of BKT.
Verify that the balance updates and that the deposit appears in the transaction history.
Withdrawal Test:

Withdraw your funds.
Confirm that the balance decreases and that the withdrawal is recorded in the history.
Merchant Registration Test:

If you are the owner, register a new merchant address.
Verify that the merchant appears in the list of registered merchants.
Payment Test:

Make a payment to a registered merchant.
Ensure that the balance updates and that the transaction appears in the history.
Real-Time Notifications:

Perform actions such as deposits, withdrawals, and payments.
Verify that notifications appear accordingly.
