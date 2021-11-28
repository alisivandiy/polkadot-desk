// Import the API & Provider and some utility functions
const { ApiPromise ,HttpProvider} = require('@polkadot/api');

// Import the test keyring (already has dev keys for Alice, Bob, Charlie, Eve & Ferdie)
const testKeyring = require('@polkadot/keyring/testing');
// Utility function for random values
const { randomAsU8a } = require('@polkadot/util-crypto');

// Some constants we are using in this sample
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const AMOUNT = 10000;

async function main () {
  // Create the API and wait until ready
  const httpProvider = new HttpProvider('https://westend-rpc.polkadot.io')
  const api = await ApiPromise.create({provider : httpProvider});

  // Create an instance of our testing keyring
  // If you're using ES6 module imports instead of require, just change this line to:
  const keyring = testKeyring.createTestKeyring();
    console.log('keyriing : ' , keyring);
  // Get the nonce for the admin key
  const { nonce } = await api.query.system.account(ALICE);
    console.log('nonce : ',nonce);
  // Find the actual keypair in the keyring
  const alicePair = keyring.getPair(ALICE);
    console.log('alice key paiir : ' , alicePair);
  // Create a new random recipient
  const recipient = keyring.addFromSeed(randomAsU8a(32)).address;

  console.log('Sending', AMOUNT, 'from', alicePair.address, 'to', recipient, 'with nonce', nonce.toString());

  
  // Do the transfer and track the actual status
  api.tx.balances
    .transfer(recipient, AMOUNT)
    .signAndSend(alicePair, { nonce }, ({ events = [], status }) => {
      console.log('Transaction status:', status.type);

      if (status.isInBlock) {
        console.log('Included at block hash', status.asInBlock.toHex());
        console.log('Events:');

        events.forEach(({ event: { data, method, section }, phase }) => {
          console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
        });
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex());

        process.exit(0);
      }
    });
}

main().catch(console.error);