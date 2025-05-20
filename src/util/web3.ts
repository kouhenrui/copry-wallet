import Web3 from "web3";

const web3 = new Web3(process.env.ETH_RPC_URL!);

export const getBalance = async (address: string) => {
  const balanceWei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balanceWei, "ether") + " ETH";
};

export const transfer = async (
  from: string,
  to: string,
  amount: number,
  privateKey: string
) => {
  const nonce = await web3.eth.getTransactionCount(from);
  const tx = {
    to,
    value: web3.utils.toWei(amount.toString(), "ether"),
    gas: 21000,
    nonce,
  };
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction!
  );
  return receipt.transactionHash;
};
