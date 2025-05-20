import { ethers } from "ethers";

export const ethProvider = new ethers.JsonRpcProvider(
  process.env.ETH_RPC_URL || "https://mainnet.infura.io/v3/YOUR_API_KEY"
);
