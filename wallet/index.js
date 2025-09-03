const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

class Wallet {
  constructor({ privateKey } = {}) {
    this.balance = INITIAL_BALANCE;
    this.keyPair = privateKey ? ec.keyFromPrivate(privateKey, 'hex') : ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data)).toDER('hex');
  }

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  static calculateBalance({ chain, address }) {
    // Check if the address has ever sent a transaction by iterating backwards.
    // The first transaction found from the address is its most recent one.
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          // The balance is the "change" output sent back to the sender's address.
          return transaction.outputMap[address];
        }
      }
    }

    // If the address has never sent a transaction, its balance is the sum of all outputs it has received.
    let outputsTotal = 0;
    for (const block of chain) {
      for (const transaction of block.data) {
        if (transaction.outputMap[address]) {
          outputsTotal += transaction.outputMap[address];
        }
      }
    }

    return INITIAL_BALANCE + outputsTotal;
  }
}

module.exports = Wallet;