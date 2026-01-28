// Command: npx hardhat run scripts/deploy.js --network localhost
const hre = require("hardhat");

async function main() {
    const DocVerify = await hre.ethers.getContractFactory("DocVerify");
    const contract = await DocVerify.deploy({ gasLimit: 3000000 });
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
    const fs = require("fs");
    fs.writeFileSync("deployed_address.txt", contract.address);
}

main().catch((error) => {
    console.error("FATAL ERROR:");
    console.error(error);
    if (error.transaction) {
        console.error("Transaction mismatch or Data:", error.transaction);
    }
    if (error.reason) {
        console.error("Reason:", error.reason);
    }
    process.exitCode = 1;
});
