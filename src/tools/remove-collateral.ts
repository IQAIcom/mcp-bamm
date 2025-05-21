import dedent from "dedent";
import type { Tool } from "fastmcp";
import type { Address } from "viem";
import { z } from "zod";
import formatNumber from "../lib/format-number.js";
import { RemoveCollateralService } from "../services/remove-collateral.js";
import { WalletService } from "../services/wallet.js";

const removeCollateralToolParams = z.object({
	bammAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("The address of the BAMM contract"),
	amount: z.string().min(1).describe("The amount of collateral to remove"),
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

export type RemoveCollateralToolParams = z.infer<
	typeof removeCollateralToolParams
>;

export const removeCollateralTool: Tool<
	undefined,
	typeof removeCollateralToolParams
> = {
	name: "REMOVE_COLLATERAL",
	description: "Remove collateral from your BAMM position",
	parameters: removeCollateralToolParams,
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
			const removeCollateralService = new RemoveCollateralService(
				walletService,
			);

			const result = await removeCollateralService.execute({
				bammAddress: params.bammAddress as Address,
				collateralToken: params.collateralToken as Address | undefined,
				collateralTokenSymbol: params.collateralTokenSymbol,
				amount: params.amount,
			});

			return dedent`
        ✅ Collateral Removal Successful

        🌐 BAMM Address: ${params.bammAddress}
        🔓 Amount: ${formatNumber(Number(params.amount))}
        💰 Token: ${params.collateralTokenSymbol ?? params.collateralToken}
        🔗 Transaction: ${result.txHash}

        Collateral has been removed from your BAMM position.
      `;
		} catch (error) {
			if (error instanceof Error) {
				return dedent`
          ❌ Collateral Removal Failed

          Error: ${error.message}

          Please verify your inputs and try again.
        `;
			}
			return "An unknown error occurred while removing collateral";
		}
	},
};
