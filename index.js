// Import the API, Keyring and some utility functions
const { ApiPromise, WsProvider, HttpProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");

const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

async function main() {
  // Instantiate the API
  //const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
  const httpProvider = new HttpProvider("https://westend-rpc.polkadot.io");
  const api = await ApiPromise.create();

  const keyring = new Keyring({ type: "sr25519" });
  const alice = keyring.addFromUri("//Alice");
  const transfer = api.tx.balances.transferKeepAlive(BOB, 0.001);

  console.log("transfer :", transfer);
  console.log("transferHex", transfer.toHex());
  let transferTx = api.tx(transfer.toHex());
  let signedtxn = await transferTx.signAsync(alice);
  console.log("signedtxn", signedtxn);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
