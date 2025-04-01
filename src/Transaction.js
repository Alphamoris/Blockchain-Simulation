const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.signature = '';
    }

    calculateHash() {
        return SHA256(
            this.fromAddress +
            this.toAddress +
            this.amount +
            this.timestamp
        ).toString();
    }

    signTransaction(signingKey) {
        // Mining reward transactions don't need to be signed
        if (this.fromAddress === null) return;
        
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }
        
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        // Mining reward transactions are valid without signature
        if (this.fromAddress === null) return true;
        
        // Check if transaction has a signature
        if (!this.signature || this.signature.length === 0) {
            // Instead of throwing, return false to prevent crashes during validation
            console.warn('Transaction validation failed: No signature in this transaction');
            return false;
        }
        
        try {
            const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
            return publicKey.verify(this.calculateHash(), this.signature);
        } catch (error) {
            console.error('Transaction validation error:', error.message);
            return false;
        }
    }
}

module.exports = Transaction; 