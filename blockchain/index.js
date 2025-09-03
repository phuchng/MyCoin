const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const cryptoHash = require('../util/crypto-hash');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

const CHAIN_KEY = 'chain';

class Blockchain {
  constructor({ redisClient }) {
    this.redisClient = redisClient;
    this.chain = [Block.genesis()];
  }

  static async create({ redisClient }) {
    const blockchain = new Blockchain({ redisClient });
    await blockchain.loadChain();
    return blockchain;
  }

  async loadChain() {
    const chainJson = await this.redisClient.get(CHAIN_KEY);
    if (chainJson) {
      console.log('Blockchain loaded from persistence.');
      this.chain = JSON.parse(chainJson).map(block => new Block(block));
    } else {
      await this.saveChain();
    }
  }

  async saveChain() {
    await this.redisClient.set(CHAIN_KEY, JSON.stringify(this.chain));
  }

  async addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });
    this.chain.push(newBlock);
    await this.saveChain();
    return newBlock;
  }

  async replaceChain(chain, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }
    if (onSuccess) await onSuccess();
    console.log('replacing chain with', chain);
    this.chain = chain.map(block => new Block(block)); // Ensure blocks are instances
    await this.saveChain();
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