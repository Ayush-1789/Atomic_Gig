
import { ErgoHDKey } from "@fleet-sdk/wallet";
import { ErgoAddress, Network } from "@fleet-sdk/core";

const mnemonic = "champion illness engine bus insane trial focus sponsor coyote bulb dirt task junior defense sudden";
const targetAddress = "9ehJUwRxRzADUYxWfH5aenpBxuXPthi8PjS9BWQBTGBzsuEFC6Q";

async function verifyOwnership() {
    console.log(`Looking for: ${targetAddress}`);
    const rootKey = await ErgoHDKey.fromMnemonic(mnemonic);

    // Check Receive Paths (0/0 to 0/50)
    const receiveAccount = rootKey.derive("m/44'/429'/0'/0");
    for (let i = 0; i < 50; i++) {
        const key = receiveAccount.deriveChild(i);
        const addr = ErgoAddress.fromPublicKey(key.publicKey, Network.Mainnet).toString();
        if (addr === targetAddress) {
            console.log(`MATCH FOUND! Index: 0 (Receive), Address Index: ${i}`);
            console.log(`Path: m/44'/429'/0'/0/${i}`);
            return;
        }
    }

    // Check Change Paths (0/1 to 0/50)
    const changeAccount = rootKey.derive("m/44'/429'/0'/1");
    for (let i = 0; i < 50; i++) {
        const key = changeAccount.deriveChild(i);
        const addr = ErgoAddress.fromPublicKey(key.publicKey, Network.Mainnet).toString();
        if (addr === targetAddress) {
            console.log(`MATCH FOUND! Index: 1 (Change), Address Index: ${i}`);
            console.log(`Path: m/44'/429'/0'/1/${i}`);
            return;
        }
    }

    console.log("❌ Address NOT found in first 50 receive or change indices.");
}

async function checkBalance() {
    try {
        const res = await fetch(`https://api.ergoplatform.com/api/v1/addresses/${targetAddress}/balance/total`);
        const data = await res.json();
        console.log(`\nBalance for target: ${Number(data.confirmed?.nanoErgs || 0n) / 1e9} ERG`);
    } catch (e) {
        console.log("Failed to check balance");
    }
}

await verifyOwnership();
await checkBalance();
