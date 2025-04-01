const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');
const path = require('path');

class Wallet {
    constructor() {
        this.keyPair = null;
        this.publicKey = '';
        this.privateKey = '';
    }

    generateKeyPair() {
        this.keyPair = ec.genKeyPair();
        this.privateKey = this.keyPair.getPrivate('hex');
        this.publicKey = this.keyPair.getPublic('hex');
        return {
            privateKey: this.privateKey,
            publicKey: this.publicKey
        };
    }

    getKeyPair() {
        return this.keyPair;
    }

    getPrivateKey() {
        return this.privateKey;
    }

    getPublicKey() {
        return this.publicKey;
    }

    saveToFile(filename) {
        const data = {
            privateKey: this.privateKey,
            publicKey: this.publicKey
        };
        const walletDir = path.join(__dirname, '../wallets');
        
        if (!fs.existsSync(walletDir)) {
            fs.mkdirSync(walletDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(walletDir, `${filename}.json`), 
            JSON.stringify(data, null, 2)
        );
    }

    loadFromFile(filename) {
        const walletPath = path.join(__dirname, '../wallets', `${filename}.json`);
        
        if (!fs.existsSync(walletPath)) {
            throw new Error(`Wallet file ${filename}.json not found`);
        }
        
        const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        this.privateKey = data.privateKey;
        this.publicKey = data.publicKey;
        this.keyPair = ec.keyFromPrivate(this.privateKey);
        
        return {
            privateKey: this.privateKey,
            publicKey: this.publicKey
        };
    }

    static listWallets() {
        const walletDir = path.join(__dirname, '../wallets');
        
        if (!fs.existsSync(walletDir)) {
            return [];
        }
        
        return fs.readdirSync(walletDir)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    }
}

module.exports = Wallet; 