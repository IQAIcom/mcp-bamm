import { elizaLogger } from "@elizaos/core";
import { erc20Abi } from "viem";
import type { Address } from "viem";
import { BAMM_ABI } from "../lib/bamm.abi.js";
import { getTokenAddressFromSymbol } from "../lib/symbol-to-address.js";
import { checkTokenBalance, ensureTokenApproval } from "../lib/token-utils.js";
import { validateTokenAgainstBAMM } from "../lib/token-validator.js";
import type { WalletService } from "./wallet.js";

export interface BorrowParams {
	bammAddress: Address;
	borrowToken?: Address;
	borrowTokenSymbol?: string;
	amount: string;
}

export class BorrowService {
	constructor(private walletService: WalletService) {}

	async execute(params: BorrowParams): Promise<{ txHash: string }> {
		let { bammAddress, borrowToken, borrowTokenSymbol, amount } = params;

		if (!borrowToken && !borrowTokenSymbol) {
			throw new Error("Either borrowToken or borrowTokenSymbol is required");
		}
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();

		if (!walletClient || !walletClient.account) {
			throw new Error("Wallet client is not initialized");
		}

		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Math.floor(Number(amount) * 1e18));

		try {
			if (borrowTokenSymbol) {
				borrowToken = await getTokenAddressFromSymbol(borrowTokenSymbol);
			}

			if (!borrowToken) {
				throw new Error("Could not resolve borrow token address");
			}

			const tokenValidation = await validateTokenAgainstBAMM(
				bammAddress,
				borrowToken,
				publicClient,
			);

			const collateralBalance: bigint = await publicClient.readContract({
				address: borrowToken,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (collateralBalance < amountInWei) {
				throw new Error("Insufficient collateral token balance");
			}

			await checkTokenBalance(
				borrowToken,
				userAddress,
				amountInWei,
				publicClient,
			);
			await ensureTokenApproval(
				borrowToken,
				bammAddress,
				amountInWei,
				publicClient,
				walletClient,
			);

			const rentedMultiplier: bigint = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "rentedMultiplier",
				args: [],
			});

			// Calculate rent based on borrowed amount and rentedMultiplier
			const rent = (amountInWei * rentedMultiplier) / BigInt(1e18);

			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: tokenValidation.isToken0 ? -amountInWei : 0n,
				token1Amount: tokenValidation.isToken1 ? -amountInWei : 0n,
				rent: rent,
				to: userAddress,
				token0AmountMin: 0n,
				token1AmountMin: 0n,
				closePosition: false,
				approveMax: false,
				v: 0,
				r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
				s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
				deadline,
			};

			const { request: executeRequest } = await publicClient.simulateContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "executeActions",
				args: [action],
				account: walletClient.account,
			});
			const txHash = await walletClient.writeContract(executeRequest);
			await publicClient.waitForTransactionReceipt({ hash: txHash });

			return { txHash };
		} catch (error) {
			elizaLogger.error("Error in borrow service", error);
			throw error;
		}
	}
}
