import dedent from "dedent";
import type { Tool } from "fastmcp";
import type { Address } from "viem";
import { z } from "zod";
import formatNumber from "../lib/format-number.js";
import { AddCollateralService } from "../services/add-collateral.js";
import { WalletService } from "../services/wallet.js";

const addCollateralToolParams = z.object({
	bammAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("The address of the BAMM contract"),
	amount: z.string().min(1).describe("The amount of collateral to add"),
	collateralToken: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.optional()
		.describe("The address of the collateral token"),
	collateralTokenSymbol: z
		.string()
		.optional()
		.describe("The symbol of the collateral token (e.g., 'IQT')"),
});

export type AddCollateralToolParams = z.infer<typeof addCollateralToolParams>;

export const addCollateralTool: Tool<
	undefined,
	typeof addCollateralToolParams
> = {
	name: "ADD_COLLATERAL",
	description: "Add collateral to your BAMM position",
	parameters: addCollateralToolParams,
	execute: async (params) => {
		try {
			if (!params.collateralToken && !params.collateralTokenSymbol) {
				return "Error: Either collateralToken address or collateralTokenSymbol is required";
			}

			const privateKey = process.env.WALLET_PRIVATE_KEY;
			if (!privateKey) {
				return "Error: WALLET_PRIVATE_KEY environment variable is not set. Please set it with your wallet's private key (without 0x prefix).";
			}

			const walletService = new WalletService(privateKey);
			const addCollateralService = new AddCollateralService(walletService);

			const result = await addCollateralService.execute({
				bammAddress: params.bammAddress as Address,
				collateralToken: params.collateralToken as Address | undefined,
				collateralTokenSymbol: params.collateralTokenSymbol,
				amount: params.amount,
			});

			return dedent`
        ✅ Collateral Addition Successful

        🌐 BAMM Address: ${params.bammAddress}
        🔒 Amount: ${formatNumber(Number(params.amount))}
        💰 Token: ${params.collateralTokenSymbol ?? params.collateralToken}
        🔗 Transaction: ${result.txHash}

        Collateral has been added to your BAMM position.
      `;
		} catch (error) {
			if (error instanceof Error) {
				return dedent`
          ❌ Collateral Addition Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `;
			}
			return "An unknown error occurred while adding collateral";
		}
	},
};
