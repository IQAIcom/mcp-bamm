import { z } from "zod";
import { LendService } from "../services/lend.js";
import { WalletService } from "../services/wallet.js";
import dedent from "dedent";
import formatNumber from "../lib/format-number.js";
import type { Address } from "viem";
import type { Tool } from "fastmcp";

const lendToolParams = z.object({
	bammAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("The address of the BAMM contract"),
	amount: z.string().min(1).describe("The amount of LP tokens to lend"),
});

export type LendToolParams = z.infer<typeof lendToolParams>;

export const lendTool: Tool<undefined, typeof lendToolParams> = {
	name: "LEND",
	description: "Lend Fraxswap LP tokens to a BAMM contract",
	parameters: lendToolParams,
	execute: async (params) => {
		try {
			const privateKey = process.env.WALLET_PRIVATE_KEY;
			if (!privateKey) {
				return "Error: WALLET_PRIVATE_KEY environment variable is not set. Please set it with your wallet's private key (without 0x prefix).";
			}

			const walletService = new WalletService(privateKey);
			const lendService = new LendService(walletService);

			const result = await lendService.execute({
				bammAddress: params.bammAddress as Address,
				amount: params.amount,
			});

			return dedent`
        ✅ Lending Successful

        🌐 BAMM Address: ${params.bammAddress}
        💰 Amount: ${formatNumber(Number(params.amount))} LP tokens
        🔗 Transaction: ${result.txHash}

        LP tokens have been deposited to the BAMM contract.
      `;
		} catch (error) {
			if (error instanceof Error) {
				return dedent`
          ❌ Lending Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `;
			}
			return "An unknown error occurred while lending LP tokens";
		}
	},
};
