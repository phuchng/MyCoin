const MINE_RATE = 1000; // 1 giây
const INITIAL_DIFFICULTY = 3;
const MINING_REWARD = 50;
const FAUCET_AMOUNT = 100;

const FAUCET_PUBLIC_KEY = '049c241d8c7b5f9d72afc2708f0f6e59b480d4e713cc3c5a59290930e31c8879994d11be54f04dd31973987147072d99a47b2ca8e4a0bb40f02b9d49725372a014';
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