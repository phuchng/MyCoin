const fs = require('fs');
const path = require('path');
const { ec } = require('./util');

const envFilePath = path.join(__dirname, '.env');
const envExampleFilePath = path.join(__dirname, '.env.example');

function generateKeyPair() {
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate('hex');
  const publicKey = keyPair.getPublic('hex');
  return { privateKey, publicKey };
}

function setup() {
  if (fs.existsSync(envFilePath)) {
    console.log('.env file already exists. Skipping setup.');
    console.log('If you want to generate new keys, please delete the .env file and run `npm run setup` again.');
    return;
  }

  if (!fs.existsSync(envExampleFilePath)) {
    console.error('ERROR: .env.example file not found. Cannot proceed with setup.');
    process.exit(1);
  }

  console.log('Creating .env file from .env.example...');
  let envContent = fs.readFileSync(envExampleFilePath, 'utf-8');

  console.log('Generating key pairs for wallets...');
  const faucetWallet = generateKeyPair();
  const node2Wallet = generateKeyPair();

  envContent = envContent.replace(/^FAUCET_PRIVATE_KEY=.*$/m, `FAUCET_PRIVATE_KEY=${faucetWallet.privateKey}`);
  envContent = envContent.replace(/^FAUCET_PUBLIC_KEY=.*$/m, `FAUCET_PUBLIC_KEY=${faucetWallet.publicKey}`);
  envContent = envContent.replace(/^NODE2_PRIVATE_KEY=.*$/m, `NODE2_PRIVATE_KEY=${node2Wallet.privateKey}`);
  
  fs.writeFileSync(envFilePath, envContent);

  console.log('✅ Successfully created .env file with new wallet keys.');
  console.log('You can now start the application using: npm run docker:up');
}

setup();