import { BammPositionsService } from "../services/get-positions.js";
import { WalletService } from "../services/wallet.js";

export const getPositionsTool = {
	name: "GET_POSITIONS",
	description: "Get all your active BAMM positions",
	// biome-ignore lint/suspicious/noExplicitAny: <these are not used anyways>
	execute: async (_params: any, _context: any) => {
		try {
			const privateKey = process.env.WALLET_PRIVATE_KEY;
			if (!privateKey) {
				return "Error: WALLET_PRIVATE_KEY environment variable is not set. Please set it with your wallet's private key (without 0x prefix).";
			}

			const walletService = new WalletService(privateKey);
			const positionsService = new BammPositionsService(walletService);

			const positions = await positionsService.getPositions();
			const formattedPositions = positionsService.formatPositions(positions);

			return formattedPositions;
		} catch (error) {
			if (error instanceof Error) {
				return `❌ Failed to retrieve positions: ${error.message}`;
			}
			return "❌ An unknown error occurred while retrieving positions";
		}
	},
};
