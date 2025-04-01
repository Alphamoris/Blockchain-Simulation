const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Blockchain = require('./Blockchain');
const Transaction = require('./Transaction');
const Wallet = require('./Wallet');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize blockchain
const blockchain = new Blockchain();
const wallets = {};

// Create a genesis wallet for initial transactions
const genesisWallet = new Wallet();
const genesis = genesisWallet.generateKeyPair();
wallets['genesis'] = genesisWallet;

// API endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get the entire blockchain
app.get('/api/blockchain', (req, res) => {
    try {
        res.json({
            chain: blockchain.chain,
            pendingTransactions: blockchain.pendingTransactions,
            difficulty: blockchain.difficulty,
            miningReward: blockchain.miningReward,
            totalTransactions: blockchain.getTotalTransactions()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific block by index
app.get('/api/blocks/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index)) {
            return res.status(400).json({ error: 'Invalid block index' });
        }
        
        if (index < 0 || index >= blockchain.chain.length) {
            return res.status(404).json({ error: 'Block not found' });
        }
        
        res.json(blockchain.chain[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new wallet
app.post('/api/wallets', (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Wallet name is required' });
        }
        
        // Check if wallet with this name already exists
        if (wallets[name]) {
            return res.status(400).json({ error: 'Wallet with this name already exists' });
        }
        
        const wallet = new Wallet();
        const keyPair = wallet.generateKeyPair();
        wallets[name] = wallet;
        
        // Save wallet to file for persistence
        try {
            wallet.saveToFile(name);
        } catch (err) {
            console.warn('Could not save wallet to file:', err.message);
        }
        
        res.status(201).json({
            name,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all wallets
app.get('/api/wallets', (req, res) => {
    try {
        const result = {};
        
        for (const [name, wallet] of Object.entries(wallets)) {
            result[name] = {
                publicKey: wallet.getPublicKey(),
                balance: blockchain.getBalanceOfAddress(wallet.getPublicKey())
            };
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific wallet by name
app.get('/api/wallets/:name', (req, res) => {
    try {
        const { name } = req.params;
        
        if (!wallets[name]) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        
        const wallet = wallets[name];
        
        res.json({
            name,
            publicKey: wallet.getPublicKey(),
            balance: blockchain.getBalanceOfAddress(wallet.getPublicKey())
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new transaction
app.post('/api/transactions', (req, res) => {
    try {
        const { fromWallet, toAddress, amount } = req.body;
        
        if (!fromWallet || !toAddress || amount === undefined) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }
        
        if (!wallets[fromWallet]) {
            return res.status(404).json({ error: 'Source wallet not found' });
        }
        
        const wallet = wallets[fromWallet];
        const transaction = new Transaction(wallet.getPublicKey(), toAddress, parsedAmount);
        transaction.signTransaction(wallet.getKeyPair());
        
        try {
            blockchain.addTransaction(transaction);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get pending transactions
app.get('/api/transactions/pending', (req, res) => {
    try {
        res.json(blockchain.pendingTransactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a direct mining reward transaction (for demo purposes)
app.post('/api/transactions/direct-reward', (req, res) => {
    try {
        const { toAddress, amount = blockchain.miningReward } = req.body;
        
        if (!toAddress) {
            return res.status(400).json({ error: 'Recipient address is required' });
        }
        
        // Create a mining reward transaction (fromAddress is null)
        const rewardTx = new Transaction(null, toAddress, amount);
        blockchain.pendingTransactions.push(rewardTx);
        
        res.status(201).json({ 
            message: 'Direct mining reward transaction created',
            transaction: rewardTx
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mine pending transactions
app.post('/api/mine', (req, res) => {
    try {
        const { minerWallet } = req.body;
        
        if (!minerWallet) {
            return res.status(400).json({ error: 'Miner wallet name is required' });
        }
        
        if (!wallets[minerWallet]) {
            return res.status(404).json({ error: 'Miner wallet not found' });
        }
        
        // Check if there are any transactions to mine
        if (blockchain.pendingTransactions.length === 0) {
            return res.status(400).json({ error: 'No pending transactions to mine' });
        }
        
        const rewardAddress = wallets[minerWallet].getPublicKey();
        const minedBlock = blockchain.minePendingTransactions(rewardAddress);
        
        res.json({ 
            message: 'Block mined successfully',
            latestBlock: minedBlock
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check blockchain validity
app.get('/api/validate', (req, res) => {
    try {
        const isValid = blockchain.isChainValid();
        res.json({ valid: isValid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tamper with a block (for demonstration)
app.post('/api/tamper', (req, res) => {
    try {
        const { blockIndex, newData } = req.body;
        
        if (blockIndex === undefined || !newData) {
            return res.status(400).json({ error: 'Block index and new data are required' });
        }
        
        const parsedIndex = parseInt(blockIndex);
        if (isNaN(parsedIndex)) {
            return res.status(400).json({ error: 'Block index must be a number' });
        }
        
        try {
            blockchain.tamperWithBlock(parsedIndex, newData);
            res.json({ message: `Block ${parsedIndex} has been tampered with` });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset the blockchain
app.post('/api/reset', (req, res) => {
    try {
        blockchain.resetChain();
        res.json({ message: 'Blockchain has been reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get blockchain statistics
app.get('/api/stats', (req, res) => {
    try {
        res.json({
            blocksCount: blockchain.chain.length,
            transactionsCount: blockchain.getTotalTransactions(),
            pendingTransactionsCount: blockchain.pendingTransactions.length,
            difficulty: blockchain.difficulty,
            miningReward: blockchain.miningReward
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: Date.now() });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Blockchain API server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the blockchain explorer`);
});

module.exports = app; 