import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'; // Import dotenv to load environment variables

// Get the private key and RPC URL from the .env file
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x60bbe10a196a4e71451c0f6e9ec9beab454c2a5ac0542aa5b8b733ff5719fec3"; 
// Fallback is often the default Hardhat test key, but will not work on Quorum

// The Quorum Quickstart exposes the main RPC node on 8545 (for the rpcnode container)
// If you are connecting to a specific node, use its exposed port (e.g., 20000 for member1)
const QUORUM_RPC_URL = process.env.QUORUM_RPC_URL || "http://43.216.155.106:8545"; 

const config: HardhatUserConfig = {
  // Your desired Solidity version
  solidity: "0.8.28", 
  
  // Define the 'quorum' network for deployment
  networks: {
    quorum: {
      url: QUORUM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      // Quorum/Besu often requires specific gas settings, 
      // especially on development networks using IBFT/Raft
      gasPrice: 0, 
      gas: 30000000, // High gas limit just in case
    },
    // You can keep the default hardhat network for testing
    hardhat: {
      // Configuration for the built-in Hardhat Network
    },
  },
  
};

export default config;