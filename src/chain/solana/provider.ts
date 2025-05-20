import { Connection, clusterApiUrl } from "@solana/web3.js";
import { env } from "../../util/env";
// 设置Solana连接
export const solConnection = new Connection(
  env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
  "confirmed"
);