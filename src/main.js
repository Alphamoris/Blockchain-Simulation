const Blockchain = require('./Blockchain');
const Transaction = require('./Transaction');
const Block = require('./Block');
const Wallet = require('./Wallet');

// Create a demo function to show blockchain functionality
function blockchainDemo() {
    console.log('⛓️ BLOCKCHAIN SIMULATION DEMO ⛓️');
    console.log('==================================');
    
    // Initialize a new blockchain
    const myCoin = new Blockchain();
    console.log('Creating a new blockchain...');
    console.log('Genesis block created!');
    
    // Create wallets
    console.log('\n📝 Creating wallets...');
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const minerWallet = new Wallet();
    
    const alice = wallet1.generateKeyPair();
    const bob = wallet2.generateKeyPair();
    const miner = minerWallet.generateKeyPair();
    
    console.log(`Alice's wallet created with public key: ${alice.publicKey.substring(0, 20)}...`);
    console.log(`Bob's wallet created with public key: ${bob.publicKey.substring(0, 20)}...`);
    console.log(`Miner's wallet created with public key: ${miner.publicKey.substring(0, 20)}...`);
    
    // Creating some transactions
    console.log('\n💰 Creating transactions...');
    
    const tx1 = new Transaction(alice.publicKey, bob.publicKey, 50);
    tx1.signTransaction(wallet1.getKeyPair());
    myCoin.addTransaction(tx1);
    console.log('Transaction 1: Alice sends 50 coins to Bob');
    
    const tx2 = new Transaction(bob.publicKey, alice.publicKey, 25);
    tx2.signTransaction(wallet2.getKeyPair());
    myCoin.addTransaction(tx2);
    console.log('Transaction 2: Bob sends 25 coins back to Alice');
    
    // Mine the pending transactions
    console.log('\n⛏️ Mining pending transactions...');
    console.log('This might take a moment...');
    myCoin.minePendingTransactions(miner.publicKey);
    console.log('Block mined and added to the blockchain!');
    
    // Display blockchain
    console.log('\n🔍 Current blockchain:');
    displayBlockchain(myCoin);
    
    // Check balances
    console.log('\n💼 Account balances:');
    console.log(`Alice's balance: ${myCoin.getBalanceOfAddress(alice.publicKey)}`);
    console.log(`Bob's balance: ${myCoin.getBalanceOfAddress(bob.publicKey)}`);
    console.log(`Miner's balance: ${myCoin.getBalanceOfAddress(miner.publicKey)}`);
    
    // Add more transactions
    console.log('\n💰 Creating more transactions...');
    
    const tx3 = new Transaction(alice.publicKey, bob.publicKey, 10);
    tx3.signTransaction(wallet1.getKeyPair());
    myCoin.addTransaction(tx3);
    console.log('Transaction 3: Alice sends 10 more coins to Bob');
    
    // Mine again
    console.log('\n⛏️ Mining pending transactions again...');
    myCoin.minePendingTransactions(miner.publicKey);
    console.log('New block mined and added to the blockchain!');
    
    // Display blockchain again
    console.log('\n🔍 Updated blockchain:');
    displayBlockchain(myCoin);
    
    // Check balances again
    console.log('\n💼 Updated account balances:');
    console.log(`Alice's balance: ${myCoin.getBalanceOfAddress(alice.publicKey)}`);
    console.log(`Bob's balance: ${myCoin.getBalanceOfAddress(bob.publicKey)}`);
    console.log(`Miner's balance: ${myCoin.getBalanceOfAddress(miner.publicKey)}`);
    
    // Verify blockchain integrity
    console.log('\n✅ Verifying blockchain integrity...');
    console.log(`Is blockchain valid? ${myCoin.isChainValid() ? 'Yes' : 'No'}`);
    
    // Demonstrate tampering detection
    console.log('\n🚫 Demonstrating tampering detection...');
    console.log('Tampering with block 1...');
    myCoin.tamperWithBlock(1, [{ fromAddress: alice.publicKey, toAddress: bob.publicKey, amount: 999 }]);
    
    // Verify blockchain integrity after tampering
    console.log('\n✅ Verifying blockchain integrity after tampering...');
    console.log(`Is blockchain valid? ${myCoin.isChainValid() ? 'Yes' : 'No'}`);
    
    console.log('\nDemo completed! 🎉');
}

function displayBlockchain(blockchain) {
    for (let i = 0; i < blockchain.chain.length; i++) {
        const block = blockchain.chain[i];
        console.log(`Block #${block.index}`);
        console.log(`Timestamp: ${new Date(block.timestamp).toLocaleString()}`);
        console.log(`Previous Hash: ${block.previousHash}`);
        console.log(`Hash: ${block.hash}`);
        console.log(`Nonce: ${block.nonce}`);
        console.log('Transactions:');
        
        if (block.transactions.length === 0) {
            console.log('  No transactions (Genesis block)');
        } else {
            for (const tx of block.transactions) {
                console.log(`  From: ${tx.fromAddress ? tx.fromAddress.substring(0, 20) + '...' : 'System (Mining Reward)'}`);
                console.log(`  To: ${tx.toAddress.substring(0, 20)}...`);
                console.log(`  Amount: ${tx.amount}`);
                console.log(`  Timestamp: ${new Date(tx.timestamp).toLocaleString()}`);
                console.log('  ---');
            }
        }
        console.log('-----------------------------------');
    }
}

// Run the demo
blockchainDemo(); 