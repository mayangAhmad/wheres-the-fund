import { ethers } from "hardhat";

// 1. PASTE YOUR ADMIN WALLET ADDRESS HERE (From Supabase)
const NEW_ADMIN_ADDRESS = "0xb727D012E6881802Dd60B4Af3CaD2b6B67D26006"; 

// 2. PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

async function main() {
  // A. Connect as the "Deployer" (Account #0)
  // This is the ONLY account allowed to transfer ownership right now.
  const [deployer] = await ethers.getSigners();
  console.log("---------------------------------------------------------");
  console.log("👤 Acting as Current Owner (Deployer):", deployer.address);

  // B. Attach to the contract
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  
  // FIX: Cast to 'any' to stop TypeScript from complaining about missing properties
  const contract = CampaignFactory.attach(CONTRACT_ADDRESS) as any;

  // C. Check who the contract thinks is the owner
  const currentOwner = await contract.owner();
  console.log("🏠 Contract says current owner is:", currentOwner);

  // D. Safety Check
  if (currentOwner.toLowerCase() === NEW_ADMIN_ADDRESS.toLowerCase()) {
    console.log("✅ Ownership has ALREADY been transferred. No action needed.");
    return;
  }

  if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ CRITICAL ERROR: The Deployer is NOT the owner!");
    console.error("   - We are signed in as:", deployer.address);
    console.error("   - The Contract is owned by:", currentOwner);
    console.error("   You cannot transfer ownership if you don't own the contract.");
    return;
  }

  // E. Execute Transfer
  console.log(`🔄 Transferring ownership to Admin: ${NEW_ADMIN_ADDRESS}...`);
  
  // This transaction sends the "Handover" command to the blockchain
  const tx = await contract.transferOwnership(NEW_ADMIN_ADDRESS);
  
  console.log(`⏳ Transaction sent: ${tx.hash}`);
  console.log("   Waiting for block confirmation...");
  
  await tx.wait();

  console.log("---------------------------------------------------------");
  console.log("🎉 SUCCESS! The Web App Admin is now the Smart Contract Owner.");
  console.log("👉 You can now put the Admin's KMS_KEY_ID in your .env.local");
  console.log("---------------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });