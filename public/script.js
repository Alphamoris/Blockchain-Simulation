// DOM Elements
const blockchainBlocks = document.getElementById('blockchain-blocks');
const blocksCount = document.getElementById('blocks-count');
const txCount = document.getElementById('tx-count');
const difficulty = document.getElementById('difficulty');
const miningReward = document.getElementById('mining-reward');
const validationResult = document.getElementById('validation-result');
const validateBtn = document.getElementById('validate-btn');
const walletNameInput = document.getElementById('wallet-name');
const createWalletBtn = document.getElementById('create-wallet-btn');
const walletDetails = document.getElementById('wallet-details');
const walletsList = document.getElementById('wallets-list');
const fromWalletSelect = document.getElementById('from-wallet');
const toAddressSelect = document.getElementById('to-address');
const txAmountInput = document.getElementById('tx-amount');
const createTxBtn = document.getElementById('create-tx-btn');
const pendingTxList = document.getElementById('pending-tx-list');
const minerWalletSelect = document.getElementById('miner-wallet');
const startMiningBtn = document.getElementById('start-mining-btn');
const miningStatus = document.getElementById('mining-status');
const tamperBlockSelect = document.getElementById('tamper-block');
const tamperAmountInput = document.getElementById('tamper-amount');
const tamperBtn = document.getElementById('tamper-btn');
const demoBtn = document.getElementById('demo-btn');
const resetBtn = document.getElementById('reset-btn');
const privateKeyModal = document.getElementById('private-key-modal');
const privateKeyDisplay = document.getElementById('private-key-display');
const copyKeyBtn = document.getElementById('copy-key-btn');
const closeModalBtn = document.querySelector('.close-btn');

// API URL - Using relative URL for same origin
const API_URL = '/api';

// State management
let blockchain = null;
let wallets = {};
let pendingTransactions = [];
let selectedWallet = null;

// API request with error handling
async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {}
        };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! Status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API error (${endpoint}):`, error.message);
        throw error;
    }
}

// Initialize the application
async function initApp() {
    try {
        await fetchBlockchain();
        await fetchWallets();
        await fetchPendingTransactions();
        setupEventListeners();
    } catch (error) {
        showError('Application initialization failed: ' + error.message);
    }
}

// Fetch the blockchain data
async function fetchBlockchain() {
    try {
        blockchain = await apiRequest('/blockchain');
        renderBlockchain();
        updateStats();
    } catch (error) {
        showError('Error fetching blockchain: ' + error.message);
    }
}

// Fetch wallets
async function fetchWallets() {
    try {
        wallets = await apiRequest('/wallets');
        renderWallets();
        updateWalletSelects();
    } catch (error) {
        showError('Error fetching wallets: ' + error.message);
    }
}

// Fetch pending transactions
async function fetchPendingTransactions() {
    try {
        pendingTransactions = await apiRequest('/transactions/pending');
        renderPendingTransactions();
    } catch (error) {
        showError('Error fetching pending transactions: ' + error.message);
    }
}

// Update blockchain statistics
function updateStats() {
    if (!blockchain) return;
    
    blocksCount.textContent = blockchain.chain.length;
    
    // Use the totalTransactions property if available, otherwise calculate
    let transactions = blockchain.totalTransactions || 0;
    if (!transactions) {
        blockchain.chain.forEach(block => {
            transactions += block.transactions.length;
        });
    }
    
    txCount.textContent = transactions;
    difficulty.textContent = blockchain.difficulty;
    miningReward.textContent = blockchain.miningReward;
}

// Render blockchain blocks
function renderBlockchain() {
    if (!blockchain) return;
    
    blockchainBlocks.innerHTML = '';
    tamperBlockSelect.innerHTML = '<option value="">Select block</option>';
    
    blockchain.chain.forEach((block, index) => {
        const blockElement = document.createElement('div');
        blockElement.className = `block ${index === 0 ? 'block-genesis' : ''}`;
        
        // Block header
        const blockHeader = document.createElement('div');
        blockHeader.className = 'block-header';
        
        const blockTitle = document.createElement('div');
        blockTitle.className = 'block-title';
        blockTitle.innerHTML = `
            <span>Block #${block.index}</span>
            <span>${new Date(block.timestamp).toLocaleString()}</span>
        `;
        
        blockHeader.appendChild(blockTitle);
        blockElement.appendChild(blockHeader);
        
        // Block hash
        const blockHash = document.createElement('div');
        blockHash.className = 'block-hash';
        blockHash.textContent = `Hash: ${truncateString(block.hash, 15)}`;
        blockHash.title = block.hash;
        blockElement.appendChild(blockHash);
        
        // Previous hash
        const prevHash = document.createElement('div');
        prevHash.className = 'block-prev-hash';
        prevHash.textContent = `Prev: ${truncateString(block.previousHash, 15)}`;
        prevHash.title = block.previousHash;
        blockElement.appendChild(prevHash);
        
        // Nonce
        const nonceElement = document.createElement('div');
        nonceElement.className = 'block-nonce';
        nonceElement.textContent = `Nonce: ${block.nonce}`;
        blockElement.appendChild(nonceElement);
        
        // Transactions
        const txContainer = document.createElement('div');
        txContainer.className = 'block-transactions';
        
        if (!block.transactions || block.transactions.length === 0) {
            const emptyTx = document.createElement('div');
            emptyTx.className = 'block-transaction';
            emptyTx.textContent = 'No transactions (Genesis block)';
            txContainer.appendChild(emptyTx);
        } else {
            block.transactions.forEach(tx => {
                const txElement = document.createElement('div');
                txElement.className = 'block-transaction';
                
                const fromTo = document.createElement('div');
                fromTo.className = 'tx-detail';
                fromTo.innerHTML = `
                    <span>From:</span>
                    <span class="tx-address" title="${tx.fromAddress || 'System (Mining Reward)'}">${tx.fromAddress ? truncateString(tx.fromAddress, 10) : 'System'}</span>
                `;
                txElement.appendChild(fromTo);
                
                const toAddress = document.createElement('div');
                toAddress.className = 'tx-detail';
                toAddress.innerHTML = `
                    <span>To:</span>
                    <span class="tx-address" title="${tx.toAddress}">${truncateString(tx.toAddress, 10)}</span>
                `;
                txElement.appendChild(toAddress);
                
                const amount = document.createElement('div');
                amount.className = 'tx-detail';
                amount.innerHTML = `
                    <span>Amount:</span>
                    <span>${tx.amount}</span>
                `;
                txElement.appendChild(amount);
                
                txContainer.appendChild(txElement);
            });
        }
        
        blockElement.appendChild(txContainer);
        blockchainBlocks.appendChild(blockElement);
        
        // Add to tamper select if not genesis block
        if (index > 0) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Block #${index}`;
            tamperBlockSelect.appendChild(option);
        }
    });
}

// Render wallets
function renderWallets() {
    walletsList.innerHTML = '';
    
    if (Object.keys(wallets).length === 0) {
        walletsList.innerHTML = '<div class="empty-state">No wallets created yet</div>';
        return;
    }
    
    for (const [name, wallet] of Object.entries(wallets)) {
        const walletCard = document.createElement('div');
        walletCard.className = 'wallet-card';
        walletCard.dataset.wallet = name;
        
        walletCard.innerHTML = `
            <div class="wallet-name">${name}</div>
            <div class="wallet-address" title="${wallet.publicKey}">${truncateString(wallet.publicKey, 25)}</div>
            <div class="wallet-balance">${wallet.balance} coins</div>
        `;
        
        walletCard.addEventListener('click', () => {
            selectedWallet = name;
            showWalletDetails(name, wallet);
        });
        
        walletsList.appendChild(walletCard);
    }
}

// Show wallet details
function showWalletDetails(name, wallet) {
    walletDetails.innerHTML = `
        <div class="wallet-details-card">
            <h4>${name}</h4>
            <div class="detail-row">
                <span>Public Key:</span>
                <span class="detail-value">${truncateString(wallet.publicKey, 20)}</span>
            </div>
            <div class="detail-row">
                <span>Balance:</span>
                <span class="detail-value balance">${wallet.balance} coins</span>
            </div>
        </div>
    `;
    
    // Highlight selected wallet in the list
    document.querySelectorAll('.wallet-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.wallet === name) {
            card.classList.add('selected');
        }
    });
}

// Update wallet select dropdowns
function updateWalletSelects() {
    fromWalletSelect.innerHTML = '<option value="">Select wallet</option>';
    toAddressSelect.innerHTML = '<option value="">Select recipient</option>';
    minerWalletSelect.innerHTML = '<option value="">Select miner wallet</option>';
    
    for (const name of Object.keys(wallets)) {
        // From wallet select
        const fromOption = document.createElement('option');
        fromOption.value = name;
        fromOption.textContent = name;
        fromWalletSelect.appendChild(fromOption);
        
        // To address select
        const toOption = document.createElement('option');
        toOption.value = wallets[name].publicKey;
        toOption.textContent = `${name} (${truncateString(wallets[name].publicKey, 10)})`;
        toAddressSelect.appendChild(toOption);
        
        // Miner wallet select
        const minerOption = document.createElement('option');
        minerOption.value = name;
        minerOption.textContent = name;
        minerWalletSelect.appendChild(minerOption);
    }
}

// Render pending transactions
function renderPendingTransactions() {
    pendingTxList.innerHTML = '';
    
    if (!pendingTransactions || pendingTransactions.length === 0) {
        pendingTxList.innerHTML = '<div class="empty-state">No pending transactions</div>';
        return;
    }
    
    pendingTransactions.forEach(tx => {
        const txCard = document.createElement('div');
        txCard.className = 'tx-card';
        
        // Find wallet names for better display
        let fromName = 'Unknown';
        let toName = 'Unknown';
        
        for (const [name, wallet] of Object.entries(wallets)) {
            if (wallet.publicKey === tx.fromAddress) {
                fromName = name;
            }
            if (wallet.publicKey === tx.toAddress) {
                toName = name;
            }
        }
        
        if (tx.fromAddress === null) {
            fromName = 'System (Mining Reward)';
        }
        
        txCard.innerHTML = `
            <div class="tx-status">Pending</div>
            <div class="tx-amount">${tx.amount} coins</div>
            <div class="tx-detail">
                <span>From:</span>
                <span class="tx-address" title="${tx.fromAddress || 'System'}">${fromName}</span>
            </div>
            <div class="tx-detail">
                <span>To:</span>
                <span class="tx-address" title="${tx.toAddress}">${toName}</span>
            </div>
            <div class="tx-detail">
                <span>Timestamp:</span>
                <span>${new Date(tx.timestamp).toLocaleString()}</span>
            </div>
        `;
        
        pendingTxList.appendChild(txCard);
    });
}

// Create a new wallet
async function createWallet() {
    const walletName = walletNameInput.value.trim();
    
    if (!walletName) {
        showError('Please enter a wallet name');
        return;
    }
    
    try {
        const newWallet = await apiRequest('/wallets', 'POST', { name: walletName });
        
        // Show private key in modal
        showPrivateKeyModal(newWallet.privateKey);
        
        // Clear input
        walletNameInput.value = '';
        
        // Refresh wallets
        await fetchWallets();
        
    } catch (error) {
        showError(`Error creating wallet: ${error.message}`);
    }
}

// Create a new transaction
async function createTransaction() {
    const fromWallet = fromWalletSelect.value;
    const toAddress = toAddressSelect.value;
    const amount = parseFloat(txAmountInput.value);
    
    if (!fromWallet) {
        showError('Please select a source wallet');
        return;
    }
    
    if (!toAddress) {
        showError('Please select a recipient');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount (greater than 0)');
        return;
    }
    
    try {
        await apiRequest('/transactions', 'POST', {
            fromWallet,
            toAddress,
            amount
        });
        
        // Clear inputs
        fromWalletSelect.value = '';
        toAddressSelect.value = '';
        txAmountInput.value = '';
        
        // Refresh transactions
        await fetchPendingTransactions();
        
        showSuccess('Transaction created successfully');
        
    } catch (error) {
        showError(`Error creating transaction: ${error.message}`);
    }
}

// Mine pending transactions
async function minePendingTransactions() {
    const minerWallet = minerWalletSelect.value;
    
    if (!minerWallet) {
        showError('Please select a miner wallet');
        return;
    }
    
    try {
        // Show mining animation
        document.querySelector('.mining-animation').classList.add('mining-active');
        miningStatus.textContent = 'Mining in progress...';
        startMiningBtn.disabled = true;
        
        const result = await apiRequest('/mine', 'POST', { minerWallet });
        
        // Update mining animation
        miningStatus.textContent = 'Mining completed successfully!';
        setTimeout(() => {
            document.querySelector('.mining-animation').classList.remove('mining-active');
            miningStatus.textContent = 'Waiting for mining to start...';
            startMiningBtn.disabled = false;
        }, 2000);
        
        // Refresh data
        await fetchBlockchain();
        await fetchWallets();
        await fetchPendingTransactions();
        
        showSuccess(`Block #${result.latestBlock.index} successfully mined!`);
        
    } catch (error) {
        document.querySelector('.mining-animation').classList.remove('mining-active');
        miningStatus.textContent = `Mining failed: ${error.message}`;
        startMiningBtn.disabled = false;
        showError(`Error mining: ${error.message}`);
    }
}

// Validate blockchain
async function validateBlockchain() {
    try {
        const data = await apiRequest('/validate');
        
        if (data.valid) {
            validationResult.textContent = 'Blockchain is valid! ✅';
            validationResult.className = 'validation-result validation-valid';
        } else {
            validationResult.textContent = 'Blockchain is invalid! ❌';
            validationResult.className = 'validation-result validation-invalid';
        }
        
        setTimeout(() => {
            validationResult.className = 'validation-result';
            validationResult.textContent = 'Chain validation status will appear here';
        }, 3000);
        
    } catch (error) {
        showError(`Error validating blockchain: ${error.message}`);
    }
}

// Tamper with a block (for demonstration)
async function tamperWithBlock() {
    const blockIndex = tamperBlockSelect.value;
    const newAmount = parseInt(tamperAmountInput.value);
    
    if (!blockIndex) {
        showError('Please select a block to tamper with');
        return;
    }
    
    if (isNaN(newAmount) || newAmount <= 0) {
        showError('Please enter a valid amount (greater than 0)');
        return;
    }
    
    try {
        // Get the current block data
        const block = blockchain.chain[blockIndex];
        
        if (!block || !block.transactions || block.transactions.length === 0) {
            showError('Selected block has no transactions to tamper with');
            return;
        }
        
        // Create tampered transaction data - modify the first transaction
        const tamperedTx = [...block.transactions];
        tamperedTx[0] = {
            ...tamperedTx[0],
            amount: newAmount
        };
        
        await apiRequest('/tamper', 'POST', {
            blockIndex,
            newData: tamperedTx
        });
        
        showWarning(`Block ${blockIndex} has been tampered with! Validate the chain to see the effect.`);
        
        // Refresh blockchain
        await fetchBlockchain();
        
        // Clear inputs
        tamperBlockSelect.value = '';
        tamperAmountInput.value = '';
        
    } catch (error) {
        showError(`Error tampering with block: ${error.message}`);
    }
}

// Reset the blockchain
async function resetBlockchain() {
    if (!confirm('Are you sure you want to reset the blockchain? This will delete all blocks except the genesis block.')) {
        return;
    }
    
    try {
        await apiRequest('/reset', 'POST');
        
        showSuccess('Blockchain has been reset successfully');
        
        // Refresh data
        await fetchBlockchain();
        await fetchPendingTransactions();
        
    } catch (error) {
        showError(`Error resetting blockchain: ${error.message}`);
    }
}

// Run blockchain demo
async function runDemo() {
    demoBtn.disabled = true;
    demoBtn.textContent = 'Running Demo...';
    
    try {
        // Step 1: Reset the blockchain to start fresh
        await apiRequest('/reset', 'POST');
        
        // Step 2: Create demo wallets - check if they already exist
        const existingWallets = Object.keys(wallets);
        
        if (!existingWallets.includes('Alice')) {
            await apiRequest('/wallets', 'POST', { name: 'Alice' });
        }
        
        if (!existingWallets.includes('Bob')) {
            await apiRequest('/wallets', 'POST', { name: 'Bob' });
        }
        
        if (!existingWallets.includes('Miner')) {
            await apiRequest('/wallets', 'POST', { name: 'Miner' });
        }
        
        // Refresh wallets list
        await fetchWallets();
        await fetchBlockchain();
        
        // Step 3: Handle mining for initial funds
        const miner = Object.keys(wallets).find(name => name === 'Miner');
        
        if (miner) {
            // Show mining animation
            document.querySelector('.mining-animation').classList.add('mining-active');
            miningStatus.textContent = 'Demo initial mining in progress...';
            
            try {
                // Try to create a direct mining reward transaction
                // This is a special system transaction - from null to miner
                await apiRequest('/transactions/direct-reward', 'POST', {
                    toAddress: wallets[miner].publicKey,
                    amount: 100
                });
                
                // Now we have a pending transaction to mine
                await apiRequest('/mine', 'POST', { minerWallet: miner });
            } catch (error) {
                console.error('Initial mining error:', error);
                showError('Initial mining failed. Try clicking the "Reset Chain" button first, then run the demo again.');
                
                document.querySelector('.mining-animation').classList.remove('mining-active');
                miningStatus.textContent = 'Mining failed. Please try again.';
                demoBtn.disabled = false;
                demoBtn.textContent = 'Run Demo';
                return;
            }
            
            // Update UI
            miningStatus.textContent = 'Initial mining completed!';
            
            // Refresh data
            await fetchBlockchain();
            await fetchWallets();
            await fetchPendingTransactions();
        }
        
        // Step 4: Now create transactions between Alice and Bob
        const alice = Object.keys(wallets).find(name => name === 'Alice');
        const bob = Object.keys(wallets).find(name => name === 'Bob');
        
        if (alice && bob && miner) {
            // Give Alice some funds from the miner
            await apiRequest('/transactions', 'POST', {
                fromWallet: miner,
                toAddress: wallets[alice].publicKey,
                amount: 100
            });
            
            // Mine these transactions
            await apiRequest('/mine', 'POST', { minerWallet: miner });
            
            // Refresh data
            await fetchBlockchain();
            await fetchWallets();
            await fetchPendingTransactions();
            
            // Now Alice has funds and can send to Bob
            await apiRequest('/transactions', 'POST', {
                fromWallet: alice,
                toAddress: wallets[bob].publicKey,
                amount: 50
            });
            
            // Mine Alice->Bob transaction so Bob has funds
            document.querySelector('.mining-animation').classList.add('mining-active');
            miningStatus.textContent = 'Mining Alice->Bob transaction...';
            await apiRequest('/mine', 'POST', { minerWallet: miner });
            
            // Refresh data so Bob's balance is updated
            await fetchBlockchain();
            await fetchWallets();
            await fetchPendingTransactions();
            
            // Now Bob has funds and can send to Alice
            await apiRequest('/transactions', 'POST', {
                fromWallet: bob,
                toAddress: wallets[alice].publicKey,
                amount: 25
            });
            
            // Refresh transactions
            await fetchPendingTransactions();
            
            // Mine one final block with Bob->Alice transaction
            document.querySelector('.mining-animation').classList.add('mining-active');
            miningStatus.textContent = 'Demo final mining in progress...';
            
            await apiRequest('/mine', 'POST', { minerWallet: miner });
            
            // Update mining animation
            miningStatus.textContent = 'Demo mining completed!';
            setTimeout(() => {
                document.querySelector('.mining-animation').classList.remove('mining-active');
                miningStatus.textContent = 'Waiting for mining to start...';
            }, 2000);
            
            // Refresh data
            await fetchBlockchain();
            await fetchWallets();
            await fetchPendingTransactions();
        }
        
        // Complete demo
        showSuccess('Demo completed successfully! The blockchain now contains demo wallets, transactions, and mined blocks.');
        
    } catch (error) {
        console.error('Error running demo:', error);
        showError('Error running demo: ' + error.message);
        
        // Make sure to remove mining animation if there was an error
        document.querySelector('.mining-animation')?.classList.remove('mining-active');
        miningStatus.textContent = 'Mining failed. Please try again.';
    } finally {
        demoBtn.disabled = false;
        demoBtn.textContent = 'Run Demo';
    }
}

// Helper function to truncate strings
function truncateString(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// Show private key modal
function showPrivateKeyModal(privateKey) {
    privateKeyDisplay.textContent = privateKey;
    privateKeyModal.classList.add('active');
}

// Close modal
function closeModal() {
    privateKeyModal.classList.remove('active');
}

// Copy to clipboard
function copyToClipboard() {
    const privateKey = privateKeyDisplay.textContent;
    navigator.clipboard.writeText(privateKey).then(() => {
        copyKeyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyKeyBtn.textContent = 'Copy to Clipboard';
        }, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showError('Failed to copy to clipboard');
    });
}

// Notification functions
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after timeout
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showWarning(message) {
    showNotification(message, 'warning');
}

// Set up mobile menu toggle
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('show');
    });
    
    // Close menu when a nav item is clicked
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('show');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('nav') && !event.target.closest('#mobile-menu-btn')) {
            nav.classList.remove('show');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    createWalletBtn.addEventListener('click', createWallet);
    createTxBtn.addEventListener('click', createTransaction);
    startMiningBtn.addEventListener('click', minePendingTransactions);
    validateBtn.addEventListener('click', validateBlockchain);
    tamperBtn.addEventListener('click', tamperWithBlock);
    demoBtn.addEventListener('click', runDemo);
    resetBtn.addEventListener('click', resetBlockchain);
    closeModalBtn.addEventListener('click', closeModal);
    copyKeyBtn.addEventListener('click', copyToClipboard);
    
    // Set up mobile menu
    setupMobileMenu();
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === privateKeyModal) {
            closeModal();
        }
    });
    
    // Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (event) => {
            // Remove active class from all links
            document.querySelectorAll('nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            event.target.classList.add('active');
        });
    });
    
    // Input validation for amount fields
    txAmountInput.addEventListener('input', () => {
        if (txAmountInput.value < 0) {
            txAmountInput.value = 0;
        }
    });
    
    tamperAmountInput.addEventListener('input', () => {
        if (tamperAmountInput.value < 0) {
            tamperAmountInput.value = 0;
        }
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 