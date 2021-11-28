const { ApiPromise, WsProvider, HttpProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { hexToU8a , u8aToHex } = require("@polkadot/util");
const { createType, TypeRegistry } = require("@polkadot/types");
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

class DotTranscationTest {
  constructor() {

  }
}
async function main() {
  const httpProvider = new HttpProvider("https://westend-rpc.polkadot.io");
  const api = await ApiPromise.create({ provider: httpProvider });

  const tx = api.tx.balances.transfer(BOB, 0.01);
  const { nonce } = await api.query.system.account(
    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
  );

  const registry = new TypeRegistry();
  const signer = api.createType(
    "SignerPayload",
    {
      method: tx,
      nonce,
      genesisHash: api.genesisHash,
      blockHash: api.genesisHash,
      runtimeVersion: api.runtimeVersion,
      version: api.extrinsicVersion,
    },
    { version: 4 }
  );

  await offlineSign(signer.toPayload(), tx);
}

async function offlineSign(signer, tx) {
  const keyring = new Keyring({ type: "sr25519" });
  const Alice = keyring.addFromUri("//Alice");
  const registry = new TypeRegistry();
  let k = registry.createType("ExtrinsicPayload", signer, { version: 4 });

  // this is weird though, need to log an issue in common to take in
  // both hex & Uint8Array inputs for both message and signature...
  let { signature } = k.sign(Alice);
  console.log(signature);
  const verifyData = k.toU8a(true)
  Alice.verify(verifyData, hexToU8a(signature));
  const message = u8aToHex(verifyData);
  console.log(message);
  console.log("1");
  tx.addSignature(Alice.address, signature, signer);
  const hash = await tx.send();
  console.log("hashh", hash);
}

async function broadCast(tx) {}

let mainClass = new DotTranscationTest()
mainClass.main()
  .catch(console.error)
  .finally(() => process.exit());
