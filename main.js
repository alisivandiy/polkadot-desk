const { ApiPromise, WsProvider, HttpProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { hexToU8a } = require("@polkadot/util");
const { createType, TypeRegistry } = require("@polkadot/types");
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

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
  console.log("asdas");
  await offlineSign(signer.toPayload(),tx);
}

async function offlineSign(signer,tx) {
  const keyring = new Keyring({ type: "sr25519" });
  const Alice = keyring.addFromUri("//Alice");
  const registry = new TypeRegistry();
  let k = registry.createType("ExtrinsicPayload", signer, { version: 4 });
  console.log("new Txn",k);
  let { signature } = k.sign(Alice);
  console.log(signature);

 tx.addSignature(Alice.address, signature, signer);
 const hash = await tx.send();
  console.log("hashh", hash);
}

async function broadCast(tx) {
  
}

main()
  .catch(console.error)
  .finally(() => process.exit());
