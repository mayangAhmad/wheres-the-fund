import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("CampaignFactory");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("✅ CampaignFactory deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
