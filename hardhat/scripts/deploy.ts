import { ethers } from "hardhat";

async function main() {
  // 1. Get the signers (The account executing the deployment)
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const factory = await ethers.getContractFactory("CampaignFactory");
  
  // 2. Pass the deployer's address as the 'initialOwner' argument
  // 🔴 PREVIOUS ERROR: You missed passing 'deployer.address' here
  const contract = await factory.deploy(deployer.address);
  
  await contract.waitForDeployment();

  console.log("✅ CampaignFactory deployed to:", await contract.getAddress());
  console.log("👑 Contract Owner set to:", deployer.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});