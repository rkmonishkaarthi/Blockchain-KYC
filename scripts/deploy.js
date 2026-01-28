// Command: npx hardhat run scripts/deploy.js --network localhost
const hre = require("hardhat");

async function main() {
    const DocVerify = await hre.ethers.getContractFactory("DocVerify");
    const contract = await DocVerify.deploy();
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
