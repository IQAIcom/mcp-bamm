import { BammPoolsStatsService } from "../services/pool-stats.js";
import { WalletService } from "../services/wallet.js";

export const poolStatsTool = {
	name: "POOL_STATS",
	description: "Get statistics for all BAMM pools",
	// biome-ignore lint/suspicious/noExplicitAny: <these are not used anyways>
	execute: async (_params: any, _context: any) => {
		try {
			const privateKey = process.env.WALLET_PRIVATE_KEY;
			if (!privateKey) {
				return "Error: WALLET_PRIVATE_KEY environment variable is not set. Please set it with your wallet's private key (without 0x prefix).";
			}

			const walletService = new WalletService(privateKey);
			const poolStatsService = new BammPoolsStatsService(walletService);

			const pools = await poolStatsService.getPoolsStats();
			const formattedStats = poolStatsService.formatPoolsStats(pools);

			return formattedStats;
		} catch (error) {
			if (error instanceof Error) {
				return `❌ Failed to retrieve pool statistics: ${error.message}`;
			}
			return "❌ An unknown error occurred while retrieving pool statistics";
		}
	},
};
