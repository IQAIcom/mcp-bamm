import dedent from "dedent";
import type { Address } from "viem";
import { BAMM_ADDRESSES } from "../constants.js";
import { BAMM_FACTORY_ABI } from "../lib/bamm-factory.abi.js";
import { BAMM_ABI } from "../lib/bamm.abi.js";
import { formatWeiToNumber } from "../lib/format-number.js";
import type { WalletService } from "./wallet.js";

export interface BammPosition {
	bamm: Address;
	vault: {
		token0: bigint;
		token1: bigint;
		rented: bigint;
	} | null;
	// Additional Frax pool fields
	pairAddress: string;
	poolName: string;
	token0Symbol: string;
	token1Symbol: string;
}

export class BammPositionsService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async getPositions(): Promise<BammPosition[]> {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();

		if (!walletClient || !walletClient.account) {
			throw new Error("Wallet client is not initialized");
		}

		const userAddress = walletClient.account.address;

		// 1. Retrieve the list of all BAMM addresses from the factory
		const bammsArray = [
			...(await publicClient.readContract({
				address: BAMM_ADDRESSES.FACTORY,
				abi: BAMM_FACTORY_ABI,
				functionName: "bammsArray",
				args: [],
			})),
		];

		const positions: BammPosition[] = [];

		// 2. Loop through each BAMM contract address
		for (const bamm of bammsArray) {
			// 3. Check if the user is registered in this BAMM using isUser
			const isUser: boolean = await publicClient.readContract({
				address: bamm,
				abi: BAMM_ABI,
				functionName: "isUser",
				args: [userAddress],
			});

			// 4. If the user is registered, get their vault details
			if (isUser) {
				const vault = await publicClient.readContract({
					address: bamm,
					abi: BAMM_ABI,
					functionName: "getUserVault",
					args: [userAddress],
				});
				// get pair address from the BAMM contract
				const pairAddress = await publicClient.readContract({
					address: bamm,
					abi: BAMM_ABI,
					functionName: "pair",
					args: [],
				});
				// call fraxswap API to get the pool details
				const response = await fetch(
					`https://api.frax.finance/v2/fraxswap/pools/${pairAddress}`,
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch pool details: ${response.statusText}`,
					);
				}
				const poolData = await response.json();
				const poolName = poolData.pools[0].poolName;
				const token0Symbol = poolData.pools[0].token0Symbol;
				const token1Symbol = poolData.pools[0].token1Symbol;
				positions.push({
					bamm,
					vault,
					pairAddress,
					poolName,
					token0Symbol,
					token1Symbol,
				});
			}
		}

		return positions;
	}

	formatPositions(positions: BammPosition[]) {
		if (positions.length === 0 || positions.every((v) => !v)) {
			return "📊 No Active BAMM Positions Found";
		}

		const formattedPositions = positions
			.map((pos) => {
				// Skip if vault is null
				if (!pos.vault) {
					return null;
				}

				// return if token0 and token1 is 0
				if (pos.vault.token0 === 0n && pos.vault.token1 === 0n) {
					return null;
				}

				return dedent`
            **💰 BAMM Position**
            - bamm: ${pos.bamm}
						- Pair: ${pos.pairAddress}
            - ${pos.token0Symbol}: ${formatWeiToNumber(pos.vault.token0)}
            - ${pos.token1Symbol}: ${formatWeiToNumber(pos.vault.token1)}
						- rented: ${formatWeiToNumber(pos.vault.rented)}
        `;
			})
			.filter(Boolean)
			.join("\n\n");

		return `📊 *Your Active BAMM Positions*\n\n${formattedPositions}`;
	}
}
