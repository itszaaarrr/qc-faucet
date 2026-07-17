import { ethers } from '@itszaaarrr/pq-ethers';

/**
 * Sends a faucet transaction (native token transfer)
 * @param rpcUrl - The RPC endpoint URL
 * @param privateKey - The treasury wallet's private key
 * @param toAddress - The recipient address
 * @param amount - The amount to send (in token units, e.g., 5.0)
 * @returns Promise with transaction details
 */
export async function sendFaucetTx(
  rpcUrl: string,
  privateKey: string,
  toAddress: string,
  amount: number
) {
  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Get the current gas price and nonce
    const feeData = await provider.getFeeData();
    const nonce = await provider.getTransactionCount(wallet.address);

    // Prepare the transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
      nonce,
      gasLimit: 21000, // Standard transfer gas limit
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transaction receipt not available');
    }

    return {
      txHash: receipt.hash,
      from: wallet.address,
      to: toAddress,
      amount: amount.toString(),
      blockNumber: receipt.blockNumber,
    };
  } catch (error: unknown) {
    console.error('Blockchain transaction failed:', error);
    
    // Type guard for error objects with code property
    const isErrorWithCode = (e: unknown): e is { code: string; message?: string } => {
      return typeof e === 'object' && e !== null && 'code' in e;
    };
    
    // Provide user-friendly error messages
    if (isErrorWithCode(error)) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Faucet treasury has insufficient funds');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Unable to connect to blockchain network');
      } else if (error.message?.includes('nonce')) {
        throw new Error('Transaction nonce error, please try again');
      }
    }
    
    throw new Error('Failed to send transaction. Please try again later.');
  }
}

/**
 * Gets the balance of the treasury wallet
 * @param rpcUrl - The RPC endpoint URL
 * @param privateKey - The treasury wallet's private key
 * @returns Promise<string> - Balance in ether
 */
export async function getTreasuryBalance(rpcUrl: string, privateKey: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get treasury balance:', error);
    throw new Error('Unable to fetch treasury balance');
  }
}
