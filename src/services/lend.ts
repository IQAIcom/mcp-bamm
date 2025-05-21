import { elizaLogger } from "@elizaos/core";
import type { Address } from "viem";
import { BAMM_ABI } from "../lib/bamm.abi.js";
import { checkTokenBalance, ensureTokenApproval } from "../lib/token-utils.js";
import type { WalletService } from "./wallet.js";

export interface LendParams {
	bammAddress: Address;
	amount: string;
}

export class LendService {
	constructor(private walletService: WalletService) {}

	/**
	 * Lend Fraxswap LP tokens to the BAMM contract.
	 * Reads the LP token address from bamm.pair(), approves the BAMM to spend them if needed,
	 * and calls bamm.mint() to deposit.
	 */
	async execute(params: LendParams): Promise<{ txHash: string }> {
		const { bammAddress, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();

		if (!walletClient || !walletClient.account) {
			throw new Error("Wallet client is not initialized");
		}

		const userAddress = walletClient.account.address;
		const lpAmountWei = BigInt(Math.floor(Number(amount) * 1e18));
		try {
			// 1. Read the Fraxswap LP token address from the BAMM contract
			const lpTokenAddress: Address = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "pair",
				args: [],
			});

			// 2. Check user's LP token balance
			await checkTokenBalance(
				lpTokenAddress,
				userAddress,
				lpAmountWei,
				publicClient,
			);

			// 3. Approve the BAMM contract to spend LP tokens
			await ensureTokenApproval(
				lpTokenAddress,
				bammAddress,
				lpAmountWei,
				publicClient,
				walletClient,
			);
			// 4. Call bamm.mint(to, lpIn) to deposit LP and receive BAMM tokens
			const { request: mintRequest } = await publicClient.simulateContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "mint",
				args: [userAddress, lpAmountWei],
				account: walletClient.account,
			});
			const txHash = await walletClient.writeContract(mintRequest);
			await publicClient.waitForTransactionReceipt({ hash: txHash });

			return { txHash };
		} catch (error) {
			elizaLogger.error("Error in lend service", error);
			throw error;
		}
	}
}
