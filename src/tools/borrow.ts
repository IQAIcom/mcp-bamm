import dedent from "dedent";
import type { Tool } from "fastmcp";
import type { Address } from "viem";
import { z } from "zod";
import formatNumber from "../lib/format-number.js";
import { BorrowService } from "../services/borrow.js";
import { WalletService } from "../services/wallet.js";

const borrowToolParams = z.object({
	bammAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("The address of the BAMM contract"),
	amount: z.string().min(1).describe("The amount to borrow"),
	borrowToken: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.optional()
		.describe("The address of the token to borrow"),
	borrowTokenSymbol: z
		.string()
		.optional()
		.describe("The symbol of the token to borrow (e.g., 'IQT')"),
});

export type BorrowToolParams = z.infer<typeof borrowToolParams>;

export const borrowTool: Tool<undefined, typeof borrowToolParams> = {
	name: "BORROW",
	description: "Borrow tokens from a BAMM position",
	parameters: borrowToolParams,
	execute: async (params) => {
		try {
			if (!params.borrowToken && !params.borrowTokenSymbol) {
				return "Error: Either borrowToken address or borrowTokenSymbol is required";
			}

			const privateKey = process.env.WALLET_PRIVATE_KEY;
			if (!privateKey) {
				return "Error: WALLET_PRIVATE_KEY environment variable is not set. Please set it with your wallet's private key (without 0x prefix).";
			}

			const walletService = new WalletService(privateKey);
			const borrowService = new BorrowService(walletService);

			const result = await borrowService.execute({
				bammAddress: params.bammAddress as Address,
				borrowToken: params.borrowToken as Address | undefined,
				borrowTokenSymbol: params.borrowTokenSymbol,
				amount: params.amount,
			});

			return dedent`
        ✅ Borrowing Successful

        🌐 BAMM Address: ${params.bammAddress}
        💸 Amount: ${formatNumber(Number(params.amount))}
        🪙 Token: ${params.borrowTokenSymbol ?? params.borrowToken}
        🔗 Transaction: ${result.txHash}

        Tokens have been borrowed from your BAMM position.
      `;
		} catch (error) {
			if (error instanceof Error) {
				return dedent`
          ❌ Borrowing Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `;
			}
			return "An unknown error occurred while borrowing tokens";
		}
	},
};
