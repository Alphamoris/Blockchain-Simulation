# 🌐 BlockSim: Blockchain Simulator

<div align="center">
  <p><strong>A modern, interactive blockchain simulation platform for education and demonstration</strong></p>
  
  <p>
    <a href="#-live-demo">View Demo</a> •
    <a href="#-features">Features</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-usage">Usage</a> •
    <a href="#-architecture">Architecture</a>
  </p>
</div>

## 📖 Overview

BlockSim is a comprehensive blockchain simulator built with modern web technologies. It demonstrates the fundamental concepts of blockchain technology through an intuitive, interactive web interface. This educational tool allows users to create wallets, make transactions, mine blocks with proof-of-work, and visualize the entire blockchain in real-time.

The application provides a hands-on way to understand concepts like cryptographic hashing, digital signatures, proof-of-work mining, and blockchain immutability.

### ✨ Features

- **Interactive Blockchain Explorer**: Visualize blocks, transactions, and the chain structure with an intuitive UI
- **Wallet Management**: Create and manage multiple wallets with public/private key pairs using elliptic curve cryptography
- **Transaction System**: Create cryptographically signed transactions between wallets
- **Mining Simulation**: Mine pending transactions with adjustable proof-of-work difficulty
- **Tamper Detection**: Demonstrate blockchain's immutability through tampering experiments
- **Modern Web Interface**: Responsive UI with real-time updates and notifications
- **Complete API Backend**: RESTful API for programmatic interaction with the blockchain
- **Educational Tool**: Perfect for learning blockchain fundamentals and cryptography concepts
- **Docker Support**: Easy containerized deployment with Docker and Docker Compose

## 🎮 Live Demo

Experience BlockSim in action by visiting our [live demo](https://blockchain-simulation-dk.vercel.app/) or follow the installation instructions to run it locally.

## 🔧 Technologies

The project uses modern web technologies for an optimal learning experience:

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Modern responsive design
  - Dynamic DOM manipulation
  - No frameworks - pure vanilla JS for simplicity

- **Backend**:
  - Node.js and Express.js for the API server
  - RESTful API architecture
  - Modular code structure

- **Cryptography**:
  - SHA-256 hashing (via crypto-js)
  - Elliptic Curve Cryptography (secp256k1)
  - Digital signatures for transaction authentication

- **Containerization**:
  - Docker with multi-stage builds
  - Docker Compose for orchestration

## 📥 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

### Option 1: Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/blockchain-simulator.git
   cd blockchain-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Docker Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/blockchain-simulator.git
   cd blockchain-simulator
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🎯 Usage Guide

### 1. Exploring the Blockchain

The main dashboard displays:
- **Blockchain Statistics**: Total blocks, transactions, mining difficulty, and rewards
- **Block Visualization**: Interactive blocks showing hash values, transactions, and timestamps
- **Validation Tools**: Verify the integrity of the entire blockchain

Use the validation feature to check that all blocks are correctly linked and all transactions are properly signed.

### 2. Wallet Management

- **Create Wallets**: Generate new cryptographic key pairs for transaction signing
- **View Balances**: Monitor account balances across the blockchain
- **Secure Keys**: Private keys are displayed only once at creation (save them securely!)

> ⚠️ **Important Security Note**: In a real blockchain, you would never share your private key. For educational purposes only, this simulator displays the private key at wallet creation.

### 3. Transaction Creation

Creating transactions is simple:
1. Select a source wallet (sender)
2. Select a destination wallet (recipient)
3. Enter the amount to transfer
4. Create the transaction

All transactions are cryptographically signed and wait in the pending transactions pool until mined into a block.

### 4. Mining Process

The mining interface demonstrates proof-of-work:
- Select a wallet to receive the mining reward
- Start the mining process to create a new block
- Watch as the system computes a valid nonce that satisfies the difficulty requirement
- Observe how balances update after mining is complete

The mining reward is automatically added to the selected miner's wallet.

### 5. Tamper Detection Demo

To demonstrate blockchain's tamper-proof nature:
1. Select an existing block
2. Modify transaction data
3. Observe how the hash values no longer match
4. Validate the chain to see how the system detects the tampering

This demonstrates blockchain's immutability - once data is added, it cannot be changed without invalidating the entire chain.

### 6. Quick Demo

The "Run Demo" button automatically:
- Creates three sample wallets (Alice, Bob, Miner)
- Generates test transactions between them
- Mines a block containing those transactions
- Updates the blockchain visualization

This is perfect for a quick overview of the entire blockchain process.

## 🏗️ Architecture

### Core Components

1. **Block**
   - Properties: index, timestamp, transactions, previousHash, hash, nonce
   - Methods: calculateHash(), mineBlock()
   - Purpose: Represents a single block in the blockchain

2. **Blockchain**
   - Properties: chain, difficulty, pendingTransactions, miningReward
   - Methods: createGenesisBlock(), getLatestBlock(), minePendingTransactions(), addTransaction(), isChainValid()
   - Purpose: Manages the chain of blocks and provides chain-level operations

3. **Transaction**
   - Properties: fromAddress, toAddress, amount, timestamp, signature
   - Methods: calculateHash(), signTransaction(), isValid()
   - Purpose: Represents a transfer of value between addresses

4. **Wallet**
   - Properties: keyPair, publicKey, privateKey
   - Methods: generateKeyPair(), signTransaction()
   - Purpose: Manages cryptographic keys for transaction signing

### Data Flow

1. **Wallet Creation**: Generate public/private key pairs
2. **Transaction Creation**: Sign transactions with private keys
3. **Transaction Pool**: Pending transactions await mining
4. **Mining Process**: 
   - Group pending transactions into a block
   - Calculate a valid proof-of-work
   - Add the block to the blockchain
5. **Validation**: Verify integrity of the entire chain

## 📚 API Documentation

### Blockchain Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/blockchain` | GET | Get the entire blockchain | Complete chain with all blocks and transactions |
| `/api/blocks/:index` | GET | Get a specific block by index | Single block with all properties |
| `/api/validate` | GET | Validate blockchain integrity | `{ valid: true/false }` |
| `/api/reset` | POST | Reset the blockchain to genesis | Confirmation message |
| `/api/stats` | GET | Get blockchain statistics | Block count, transaction count, etc. |

### Wallet Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/wallets` | POST | Create a new wallet | `{ name: string }` | New wallet data with keys |
| `/api/wallets` | GET | Get all wallets | - | List of all wallets with balances |
| `/api/wallets/:name` | GET | Get a specific wallet | - | Wallet data with balance |

### Transaction Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/transactions` | POST | Create a new transaction | `{ fromWallet, toAddress, amount }` | New transaction data |
| `/api/transactions/pending` | GET | Get pending transactions | - | List of pending transactions |

### Mining Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/mine` | POST | Mine pending transactions | `{ minerWallet }` | Confirmation and new block data |

### Demonstration Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/tamper` | POST | Tamper with a block (for demo) | `{ blockIndex, newData }` | Confirmation message |

## 🧠 Blockchain Concepts Explained

### Cryptographic Hash Functions

BlockSim uses SHA-256 hashing which transforms input data into a fixed-size string of characters. Key properties:
- **Deterministic**: Same input always produces same output
- **Fast Computation**: Quickly calculate hash from any input
- **Avalanche Effect**: Small changes in input create large changes in output
- **One-way Function**: Cannot derive input from output

### Digital Signatures

Transactions use elliptic curve cryptography to create signatures that:
- **Prove Ownership**: Only the private key owner can create valid signatures
- **Prevent Tampering**: Any change to transaction data invalidates the signature
- **Non-repudiation**: Sender cannot deny creating the transaction

### Proof-of-Work

Mining implements a simplified proof-of-work algorithm:
1. Take transaction data + previous hash + nonce
2. Calculate SHA-256 hash
3. Check if hash meets difficulty target (starts with specific number of zeros)
4. If not, increment nonce and try again
5. Process continues until valid hash is found

This makes block creation computationally intensive, securing the blockchain against tampering.

### Blockchain Immutability

The chain structure creates immutability:
- Each block contains the previous block's hash
- Changing any data in a block changes its hash
- This invalidates all subsequent blocks
- To tamper with data, an attacker would need to redo the proof-of-work for that block and all blocks after it

## 🔮 Future Enhancements

We plan to add more features to BlockSim in future releases:

- **Consensus Algorithms**: Implement proof-of-stake and other consensus mechanisms
- **Smart Contracts**: Add basic smart contract functionality
- **Merkle Trees**: Implement Merkle trees for efficient transaction validation
- **P2P Network Simulation**: Demonstrate distributed consensus across nodes
- **Advanced Block Explorer**: Enhanced visualization of blockchain data
- **Performance Metrics**: Hash rate, difficulty adjustment, and network statistics
- **Mobile App**: Native mobile application for iOS and Android

## 🐞 Troubleshooting

### Common Issues

- **Transaction Creation Fails**: Check if the source wallet has sufficient balance
- **Mining Takes Too Long**: Reduce the mining difficulty in the blockchain configuration
- **Invalid Chain After Tampering**: This is expected behavior demonstrating blockchain integrity

### Browser Compatibility

The application works best in:
- Chrome (v90+)
- Firefox (v85+)
- Edge (v90+)
- Safari (v14+)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf) by Satoshi Nakamoto
- [Ethereum](https://ethereum.org/) for smart contract concepts
- [crypto-js](https://github.com/brix/crypto-js) for cryptographic functions
- [elliptic](https://github.com/indutny/elliptic) for elliptic curve cryptography


<div align="center">
  <p>Created with ❤️ for blockchain education and demonstration by Alphamoris</p>
  <p>Copyright © 2025 BlockSim</p>
</div> 