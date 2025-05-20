import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  Signer,
} from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { solConnection } from "./provider";

class SolanaWalletService {
  static async getBalance(address: string) {
    const publicKey = new PublicKey(address);
    const lamports = await solConnection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  }

  static async sendSol(fromSecret: number[], to: string, amount: number) {
    const from = Keypair.fromSecretKey(Uint8Array.from(fromSecret));
    const toPublicKey = new PublicKey(to);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: toPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(
      solConnection,
      transaction,
      [from]
    );
    return signature;
  }

  /**
   * Creates a new token on the Solana blockchain.
   *
   * 1. Generates a new keypair (payer) to fund the token creation.
   * 2. Requests an airdrop of 2 SOL to the payer.
   * 3. Confirms the airdrop transaction.
   * 4. Creates a new mint (token creation address) using the payer.
   * 5. Returns the mint address.
   *
   * @throws {Error} If token creation fails.
   */
  static async createToken() {
    try {
      // 1. 创建 payer 钱包
      const payer = Keypair.generate();
      console.log("Payer PublicKey:", payer.publicKey.toBase58());

      // 2. 请求空投 2 SOL
      const airdropSignature = await solConnection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      // 2. 获取最新区块信息（用于确认交易）
      const latestBlockhash = await solConnection.getLatestBlockhash(
        "confirmed"
      );
      // 3. 等待空投确认
      await solConnection.confirmTransaction(
        {
          signature: airdropSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );
      console.log("Airdrop confirmed");

      // 4. 创建 mint（代币）
      const mint = await createMint(
        solConnection,
        payer, // 付费人
        payer.publicKey, // mint authority
        null, // freeze authority
        9 // decimals
      );

      console.log("✅ Token Mint Address:", mint.toBase58());

      return {
        mint,
        payer,
      };
    } catch (err) {
      console.error("❌ Error in createToken:", err);
      throw err;
    }
  }

  // static async createToken() {
  //   // 创建一个新账户（钱包）
  //   const payer = Keypair.generate();
  //   console.log("Payer PublicKey:", payer.publicKey.toBase58());

  //   // 给钱包充值
  //   const airdropSignature = await solConnection.requestAirdrop(
  //     payer.publicKey,
  //     2 * LAMPORTS_PER_SOL
  //   );

  //   const signature = await solConnection.simulateTransaction(
  //     transaction, // 传递交易对象
  //     signers, // 可选的签名者
  //     { includeAccounts: true } // 是否包含账户数据
  //   );

  //   // 使用 confirmTransaction 确认交易
  //   await solConnection.confirmTransaction(signature, "finalized"); // 使用新的方法
  //   // await solConnection.confirmTransaction(airdropSignature);

  //   const mint = await Token.createMint(
  //     solConnection, // 连接
  //     payer, // 钱包
  //     payer.publicKey, // 创建者为钱包地址
  //     null, // 没有冻结权限
  //     9, // 精度（9个小数位）
  //     TOKEN_PROGRAM_ID // 默认Token程序ID
  //   );

  //   console.log("Token Mint Address:", mint.publicKey.toBase58());
  //   return mint;
  // }

  // async mintToken() {
  //   async function mintToken(mint: Token, recipient: Keypair, amount: number) {
  //     const mintAddress = mint.publicKey;

  //     // 创建一个新的 token account 用来接收铸造的代币
  //     const recipientTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
  //       recipient.publicKey
  //     );

  //     const transaction = new Transaction().add(
  //       mint.mintTo(
  //         recipientTokenAccount.address, // 接收地址
  //         payer, // 钱包地址
  //         [], // 签名者
  //         amount * Math.pow(10, 9) // 代币数量，考虑精度
  //       )
  //     );

  //     // 发送交易
  //     const signature = await connection.sendTransaction(transaction, [
  //       payer,
  //       recipient,
  //     ]);
  //     console.log("Mint Transaction Signature:", signature);
  //     await connection.confirmTransaction(signature);
  //   }

  //   const recipient = Keypair.generate(); // 创建一个接收钱包地址

  //   createToken().then((mint) => {
  //     mintToken(mint, recipient, 10).then(() => {
  //       console.log(
  //         "Successfully minted tokens to:",
  //         recipient.publicKey.toBase58()
  //       );
  //     });
  //   });
  // }

  // async transferToken() {
  //   async function transferToken(
  //     mint: Token,
  //     sender: Keypair,
  //     recipientPublicKey: string,
  //     amount: number
  //   ) {
  //     const senderTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
  //       sender.publicKey
  //     );
  //     const recipientTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
  //       new PublicKey(recipientPublicKey)
  //     );

  //     const transaction = new Transaction().add(
  //       mint.transfer(
  //         senderTokenAccount.address, // 发送方代币账户
  //         recipientTokenAccount.address, // 接收方代币账户
  //         sender, // 发送方钱包
  //         [], // 签名者
  //         amount * Math.pow(10, 9) // 转账数量，考虑精度
  //       )
  //     );

  //     // 发送交易
  //     const signature = await connection.sendTransaction(transaction, [sender]);
  //     console.log("Transfer Transaction Signature:", signature);
  //     await connection.confirmTransaction(signature);
  //   }

  //   const recipientAddress = "<RECIPIENT_PUBLIC_KEY>";

  //   createToken().then((mint) => {
  //     transferToken(mint, payer, recipientAddress, 5).then(() => {
  //       console.log("Successfully transferred tokens.");
  //     });
  //   });
  // }
}
export default new SolanaWalletService();
