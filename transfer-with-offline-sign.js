// ** This Test Worked Correctly , Enjoy This **
const { ApiPromise, HttpProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

class FinalTest {
  constructor(testnet) {
    const serverProvider = testnet ? "https://westend-rpc.polkadot.io" : "https://rpc.polkadot.io"

    this.serverProvider = serverProvider
    this.destinationAccount = BOB;
    this.proccessWithdraw();
  }

  async proccessWithdraw() {
    // Create DOT Api
    let httpProvider = new HttpProvider(this.serverProvider);
    const api = await ApiPromise.create({ provider: httpProvider });

    const tx = api.tx.balances.transfer(this.destinationAccount, 0.04);
    const { nonce } = await api.query.system.account(
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    );

    // Create Signer Payload , 'inClude Transaction Information'
    const SignerPayload = api.createType("SignerPayload", {
      method: tx,
      nonce,
      genesisHash: api.genesisHash,
      blockHash: api.genesisHash,
      runtimeVersion: api.runtimeVersion,
      version: 4,
    });

    await this.offlineSign(
      SignerPayload.toPayload(),
      tx,
      SignerPayload.toRaw()
    );
  }

  async offlineSign(SignerPayload, txClass, unsignedDetail) {
    // Getting Alice Account KeyPair For Sign Own Transaction
    const keyring = new Keyring({ type: "ed25519" });
    const Alice = keyring.addFromUri("//Bob");

    const hashed =
      unsignedDetail.data.length > (256 + 1) * 2
        ? blake2AsHex(unsignedDetail.data)
        : unsignedDetail.data;
    console.log(`address ${Alice.address} unsigned:${hashed}`);

    // For the Substrate signatures (MultiSiginature type) it is always 65/66 bytes in length. The first byte is always 00, 01 or 02, (00 = ed25519, 01 = sr25519, 02 = ecdsa),
    // Sign And Make ed25519 Signature
    let sigVal = Alice.sign(hashed);
    let newVal = new Uint8Array(sigVal.byteLength + 1);
    let firstByte = 0x0 // for ed25519 Type

    newVal[0] = firstByte;
    newVal.set(sigVal, 1);

    // Create Signature Data For Add in The Transaction
    const signatureData = {
        from : Alice.address,
        Signature : newVal,
        SignerPayload : SignerPayload
    }

    // Convert Tx Class To Hex For ReCreate In BroadCast
    let txHex = txClass.toHex();
    this.broadCast(txHex, signatureData);
  }

  async broadCast(txHex,signatureData) {
    try {
      // Create DOT Api
      let httpProvider = new HttpProvider(this.serverProvider);
      let api = await ApiPromise.create({ provider: httpProvider });

      // ReCreate Tx Class And Get Signature Data From Sign Function
      let txClass = api.tx(txHex);
      let {from, Signature, SignerPayload} = signatureData
      
      // Add Signer Signature To Transaction Class By Method addSignature
      txClass.addSignature(from , Signature , SignerPayload)
        
      // BroadCast Transaction By Method Send
      let sendSigned = await txClass.send();
      console.log("sendSignedResponse : ", sendSigned);
    } catch (error) {
      console.log(error.message);
    }
  }
}

new FinalTest(false);
