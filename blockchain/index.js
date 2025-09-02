const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const cryptoHash = require('../util/crypto-hash');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });
    this.chain.push(newBlock);
  }

  replaceChain(chain, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }
    if (onSuccess) onSuccess();
    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const { timestamp, lastHash, hash, nonce, difficulty, data } = block;
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if (hash !== validatedHash) return false;

      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
      
      if (!Blockchain.validTransactionData({ block, chain })) {
        console.error('Invalid transaction data in the block');
        return false;
      }
    }
    return true;
  }

  static validTransactionData({ block, chain }) {
    for (let transaction of block.data) {
      if (transaction.input.address === REWARD_INPUT.address) {
        if (Object.values(transaction.outputMap).length !== 1 || 
            Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
          return false;
        }
      } else {
        if (!Transaction.validTransaction(transaction)) {
          return false;
        }
        
        const trueBalance = Wallet.calculateBalance({
          chain: chain.slice(0, chain.indexOf(block)),
          address: transaction.input.address
        });

        if (transaction.input.amount !== trueBalance) {
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = Blockchain;