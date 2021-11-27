const {
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
  naclKeypairFromSeed,
} = require("@polkadot/util-crypto");
const { stringToU8a, u8aToHex } = require("@polkadot/util");
const { Keyring } = require("@polkadot/keyring");
const { signatureVerify } = require("@polkadot/util-crypto");

async function main() {
  const keyring = new Keyring({ type: "ed25519", ss58Format: 42 });
  // Create mnemonic string for Alice using BIP39
  const mnemonicAlice = mnemonicGenerate();
  console.log(`Generated mnemonic: ${mnemonicAlice}`);

  const pair = keyring.addFromPair(
    mnemonicAlice,
    { name: "first pair" },
    "ed25519"
  );

  console.log(pair.address);
  // Validate the mnemic string that was generated
//   const isValidMnemonic = mnemonicValidate(mnemonicAlice);

//   console.log(`isValidMnemonic: ${isValidMnemonic}`);

//   // Create valid Substrate-compatible seed from mnemonic
//   const seedAlice = mnemonicToMiniSecret(mnemonicAlice);

//   // Generate new public/secret keypair for Alice from the supplied seed
//   const { publicKey, secretKey } = naclKeypairFromSeed(seedAlice);
//   console.log(publicKey);
//   console.log(secretKey);
}

async function signAndVerify() {
  const keyring = new Keyring({ type: "sr25519", ss58Format: 2 });
  // create Alice based on the development seed
  // create Alice based on the development seed
  const alice = keyring.addFromUri("//Alice");

  // create the message and sign it
  const message = stringToU8a("this is our message");
  const signature = alice.sign(message);

  // verify the message using Alice's address
  const { isValid } = signatureVerify(message, signature, alice.address);

  // output the result
  console.log(`${u8aToHex(signature)} is ${isValid ? "valid" : "invalid"}`);
}

main().catch(console.error).finally(() => process.exit());
// signAndVerify()
//   .catch(console.error)
//   .finally(() => process.exit());

async function transfer(privateKey) {

}

transfer().catch(console.error).finally(() => process.exit());

