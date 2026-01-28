require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    console.log("Checking connection...");
    const url = process.env.SEPOLIA_URL;
    if (!url) {
        console.error("❌ SEPOLIA_URL is missing in .env");
        return;
    }
    console.log("URL found:", url.substring(0, 20) + "...");

    const key = process.env.PRIVATE_KEY;
    if (!key) {
        console.error("❌ PRIVATE_KEY is missing in .env");
        return;
    }
    console.log("Private Key found (length):", key.length);

    try {
        const provider = new ethers.providers.JsonRpcProvider(url);
        const network = await provider.getNetwork();
        console.log("✅ Connected to network:", network.name, "ChainID:", network.chainId);

        const wallet = new ethers.Wallet(key, provider);
        console.log("Wallet address:", wallet.address);

        const balance = await wallet.getBalance();
        console.log("MY_BALANCE:", ethers.utils.formatEther(balance));

        const feeData = await provider.getFeeData();
        console.log("GAS_PRICE:", ethers.utils.formatUnits(feeData.gasPrice, "gwei"));

        if (balance.lt(ethers.utils.parseEther("0.002"))) {
            console.error("WARNING: Balance is likely too low for deployment. You need at least 0.005 ETH.");
        }

    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
    }
}

main();
