const { ec } = require('../util');

const keyPair = ec.genKeyPair();

const privateKey = keyPair.getPrivate('hex');
const publicKey = keyPair.getPublic('hex');

console.log('--- Faucet Wallet Keypair ---');
console.log(`Copy these values into your .env file.`);
console.log(`FAUCET_PRIVATE_KEY=${privateKey}`);
console.log(`\nThis is the public key for the config file:`);
console.log(publicKey);
