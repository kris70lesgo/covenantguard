import { defineConfig } from "hardhat/config";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      type: "http",
      url: process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY 
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY] 
        : [],
      chainId: 80002,
      chainType: "l1",
    },
  },
});
