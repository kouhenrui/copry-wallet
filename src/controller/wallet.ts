import { Context } from "koa";
// import * as BitcoinService from "../services/bitcoin.service";
// import * as EthereumService from "../services/ethereum.service";
// import * as SolanaService from "../services/solana.service";

export const getBalance = async (ctx: Context) => {
  const { chain, address } = ctx.params;
  let balance;
//   switch (chain) {
//     case "bitcoin":
//       balance = await BitcoinService.getBalance(address);
//       break;
//     case "ethereum":
//       balance = await EthereumService.getBalance(address);
//       break;
//     case "solana":
//       balance = await SolanaService.getBalance(address);
//       break;
//     default:
//       ctx.throw(400, "Unsupported chain");
//   }
  ctx.body = { chain, address, balance };
};

export const transfer = async (ctx: Context) => {
  const { chain } = ctx.params;
//   const { to, from, amount, privateKey } = ctx.request.body;
  let txHash;
//   switch (chain) {
//     case "bitcoin":
//       txHash = await BitcoinService.transfer(from, to, amount, privateKey);
//       break;
//     case "ethereum":
//       txHash = await EthereumService.transfer(from, to, amount, privateKey);
//       break;
//     case "solana":
//       txHash = await SolanaService.transfer(from, to, amount, privateKey);
//       break;
//     default:
//       ctx.throw(400, "Unsupported chain");
//   }
  ctx.body = { status: "submitted", txHash };
};
