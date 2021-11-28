const { ApiPromise, HttpProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { hexToU8a, u8aToHex  } = require("@polkadot/util");
const {TypeRegistry,createType} = require("@polkadot/types");
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

class FinalTest {
  constructor() {
    this.destinationAccount = BOB;
    this.proccessWithdraw();
  }

  async proccessWithdraw() {
    // Create Transfer
    let httpProvider = new HttpProvider("https://rpc.polkadot.io");
    const api = await ApiPromise.create({ provider: httpProvider });

    const tx = api.tx.balances.transfer(this.destinationAccount, 0.02);
    const { nonce } = await api.query.system.account(
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    );

    const SignerPayload = api.createType("SignerPayload", {
      address : "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      method: tx,
      nonce,
      genesisHash: api.genesisHash,
      blockHash: api.genesisHash,
      runtimeVersion: api.runtimeVersion,
      version: 4,
    });
    console.log("object");
    await this.offlineSign(
      SignerPayload.toPayload(),
      tx,
      SignerPayload.registry
    );


  }

  async offlineSign(SignerPayload, txClass , registryy) {
    const keyring = new Keyring({ type: "ed25519" });
    const Alice = keyring.addFromUri("//Alice");

    let registry = new TypeRegistry(undefined)
    console.log('Odin Registry',registry);
    console.log('devaa Registry',registryy);
    let ExtrinsicPayload = createType(
        registryy,
      "ExtrinsicPayload",
      SignerPayload,
      { version: 4 }
    );

    console.log(ExtrinsicPayload);
    let { signature } = ExtrinsicPayload.sign(Alice);
    txClass.addSignature(Alice.address, signature, SignerPayload);

    this.broadCast(txClass);
  }

  async broadCast(txClass) {
    let sendSigned = await txClass.send();
    console.log("sendSignedResponse : ", sendSigned);
  }
}

let finalTest = new FinalTest();
