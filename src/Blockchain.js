const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        // Create new block with all pending transactions
        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        // Mine the block
        block.mineBlock(this.difficulty);

        // Add the block to the chain
        this.chain.push(block);

        // Reset pending transactions and add mining reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
        
        return block;
    }

    addTransaction(transaction) {
        // Validate transaction
        if (!transaction.fromAddress && !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        // Special handling for mining rewards (fromAddress is null)
        if (transaction.fromAddress !== null && !transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        // Check if sender has enough balance
        if (transaction.fromAddress !== null) {
            const senderBalance = this.getBalanceOfAddress(transaction.fromAddress);
            if (senderBalance < transaction.amount) {
                throw new Error(`Insufficient balance. Required: ${transaction.amount}, Available: ${senderBalance}`);
            }
        }

        this.pendingTransactions.push(transaction);
        return true;
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        // Loop through all blocks and transactions
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                // If address is sender, reduce balance
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                // If address is recipient, increase balance
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        return true;
    }

    isChainValid() {
        // Skip genesis block, start at index 1
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check if current block hash is valid
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.error(`Block ${i} has an invalid hash`);
                return false;
            }

            // Check if previous hash reference is correct
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`Block ${i} has an incorrect previous hash reference`);
                return false;
            }

            // Validate transactions
            for (let j = 0; j < currentBlock.transactions.length; j++) {
                const transaction = currentBlock.transactions[j];
                
                // Skip mining reward transactions (fromAddress is null)
                if (transaction.fromAddress === null) continue;
                
                if (!transaction.isValid()) {
                    console.error(`Transaction in block ${i} is invalid`);
                    return false;
                }
            }
        }
        return true;
    }

    // Reset the blockchain (added functionality)
    resetChain() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        return true;
    }

    // Simulates tampering with a block to demonstrate validation
    tamperWithBlock(blockIndex, newData) {
        if (blockIndex < 1 || blockIndex >= this.chain.length) {
            throw new Error('Invalid block index');
        }
        
        this.chain[blockIndex].transactions = newData;
        // The hash won't match now as we've changed the data
        console.log(`Block ${blockIndex} has been tampered with!`);
        return true;
    }
    
    // Get total number of transactions in the chain
    getTotalTransactions() {
        let total = 0;
        for (const block of this.chain) {
            total += block.transactions.length;
        }
        return total;
    }
}

module.exports = Blockchain; 