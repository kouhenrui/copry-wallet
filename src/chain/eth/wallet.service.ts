import { ethProvider } from "./provider";
import { ethers } from "ethers";

class EthWalletService {
  static async getBalance(address: string) {
    return ethers.formatEther(await ethProvider.getBalance(address));
  }

  static async sendTransaction(privateKey: string, to: string, amount: string) {
    const wallet = new ethers.Wallet(privateKey, ethProvider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });
    return tx;
  }
}
export default new EthWalletService();
