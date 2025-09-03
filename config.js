require('dotenv').config();
const MINE_RATE = 1000; // 1 giây
const INITIAL_DIFFICULTY = 3;
const MINING_REWARD = 50;
const FAUCET_AMOUNT = 100;

const FAUCET_PUBLIC_KEY = process.env.FAUCET_PUBLIC_KEY;
if (!FAUCET_PUBLIC_KEY) {
  console.error('FAUCET_PUBLIC_KEY is not defined. Please ensure your .env file is set up correctly.');
  console.error('Run `npm run setup` to generate a .env file and try again.');
  process.exit(1);
}

const FAUCET_INITIAL_SUPPLY = 1000000;

const GENESIS_INPUT = {
  address: '*genesis-block-pre-mine*'
};

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'genesis-hash',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [
    {
      id: 'genesis-transaction-1',
      outputMap: {
        [FAUCET_PUBLIC_KEY]: FAUCET_INITIAL_SUPPLY
      },
      input: GENESIS_INPUT
    }
  ]
};

const REWARD_INPUT = { address: '*authorized-reward*' };

// DEPRECATED: Balance is now determined by the blockchain state.
const INITIAL_BALANCE = 0;

module.exports = { 
  GENESIS_DATA, 
  MINE_RATE,
  INITIAL_BALANCE, // Kept for reference but not actively used for new wallets
  MINING_REWARD,
  REWARD_INPUT,
  FAUCET_AMOUNT,
  FAUCET_PUBLIC_KEY
};