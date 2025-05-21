import dedent from "dedent";
import type { Address } from "viem";
import { BAMM_ADDRESSES } from "../constants.js";
import { BAMM_FACTORY_ABI } from "../lib/bamm-factory.abi.js";
import { BAMM_ABI } from "../lib/bamm.abi.js";
import formatNumber from "../lib/format-number.js";
import type { WalletService } from "./wallet.js";

export interface PoolStats {
	poolAddress: string;
	bammAddress: string;
	createdAtTimestamp: string;
	token0Symbol: string;
	token0AmountLocked: number;
	token1Symbol: string;
	token1AmountLocked: number;
	tvl: number;
}

export class BammPoolsStatsService {
	// Frax API endpoint for all Fraxswap pools
	private endpoint = "https://api.frax.finance/v2/fraxswap/pools";

	constructor(private walletService: WalletService) {}

	async getPoolsStats(): Promise<PoolStats[]> {
		const publicClient = this.walletService.getPublicClient();
		const zeroAddress = "0x0000000000000000000000000000000000000000";

		// 1. Get the list of all BAMM addresses from the factory.
		const bammsOnChain: readonly Address[] = await publicClient.readContract({
			address: BAMM_ADDRESSES.FACTORY,
			abi: BAMM_FACTORY_ABI,
			functionName: "bammsArray",
			args: [],
		});

		// 2. Build a mapping: underlying Fraxswap pair address -> BAMM address.
		const pairToBammMap = new Map<string, string>();
		for (const bammAddress of bammsOnChain) {
			if (bammAddress === zeroAddress) continue;
			// Get the Fraxswap pair address from this BAMM contract.
			const pairAddress: Address = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "pair",
				args: [],
			});
			if (pairAddress && pairAddress !== zeroAddress) {
				pairToBammMap.set(pairAddress.toLowerCase(), bammAddress);
			}
		}

		// 3. Fetch the full list of pools from the Frax API endpoint.
		const response = await fetch(this.endpoint);
		if (!response.ok) {
			throw new Error(`Failed to fetch pools: ${response.statusText}`);
		}
		const data = await response.json();

		// Map the API response to our PoolStats type and add placeholder fields.
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const allPools: PoolStats[] = data.pools.map((pool: any) => ({
			...pool,
			bammAddress: "",
			bammApr: 0,
			fraxswapApr: 0,
		}));

		// 4. Filter the API pools to only include those with a matching pair address.
		const filteredPools: PoolStats[] = [];
		for (const pool of allPools) {
			const poolPair = pool.poolAddress.toLowerCase();
			if (pairToBammMap.has(poolPair)) {
				// Set the BAMM address from our mapping.
				pool.bammAddress = pairToBammMap.get(poolPair) ?? "";
				filteredPools.push(pool);
			}
		}

		filteredPools.sort((a, b) => b.tvl - a.tvl);

		return filteredPools;
	}

	formatPoolsStats(pools: PoolStats[]): string {
		if (pools.length === 0) {
			return "📊 No BAMM Pools Found";
		}

		const formattedStats = pools
			.map((pool) => {
				const poolName = `${pool.token0Symbol}/${pool.token1Symbol}`;
				return dedent`
          📊 Pool: ${poolName}
          - Pool Address: ${pool.poolAddress}
          - BAMM Address: ${pool.bammAddress}
          - TVL: $${formatNumber(pool.tvl || 0)}
          - ${pool.token0Symbol} Locked: ${formatNumber(
						pool.token0AmountLocked || 0,
					)}
          - ${pool.token1Symbol} Locked: ${formatNumber(
						pool.token1AmountLocked || 0,
					)}
        `;
			})
			.join("\n\n");

		return dedent`
      📊 *BAMM Pool Stats:*
      Total: ${pools.length}

      ${formattedStats}
    `;
	}
}
