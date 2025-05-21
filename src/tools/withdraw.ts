import { z } from "zod";
import { WithdrawService } from "../services/withdraw.js";
import { WalletService } from "../services/wallet.js";
import dedent from "dedent";
import formatNumber from "../lib/format-number.js";
import type { Address } from "viem";
import type { Tool } from "fastmcp";

const withdrawToolParams = z.object({
	bammAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("The address of the BAMM contract"),
	amount: z.string().min(1).describe("The amount of BAMM tokens to withdraw"),
});

export type WithdrawToolParams = z.infer<typeof withdrawToolParams>;

export const withdrawTool: Tool<undefined, typeof withdrawToolParams> = {
	name: "WITHDRAW",
	description:
		"Withdraw LP tokens from a BAMM contract by redeeming BAMM tokens",
	parameters: withdrawToolParams,
	execute: async (params) => {
		try {
			const privateKey = process.env.WALLET_PRIVATE_KEY;
			if (!privateKey) {
				return "Error: WALLET_PRIVATE_KEY environment variable is not set. Please set it with your wallet's private key (without 0x prefix).";
			}

			const walletService = new WalletService(privateKey);
			const withdrawService = new WithdrawService(walletService);

			const result = await withdrawService.execute({
				bammAddress: params.bammAddress as Address,
				amount: params.amount,
			});

			return dedent`
        ✅ Withdrawal Successful

        🌐 BAMM Address: ${params.bammAddress}
        💰 Amount: ${formatNumber(Number(params.amount))} BAMM tokens
        🔗 Transaction: ${result.txHash}

        LP tokens have been withdrawn from the BAMM contract.
      `;
		} catch (error) {
			if (error instanceof Error) {
				return dedent`
          ❌ Withdrawal Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `;
			}
			return "An unknown error occurred while withdrawing tokens";
		}
	},
};
