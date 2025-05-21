#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { addCollateralTool } from "./tools/add-collateral.js";
import { borrowTool } from "./tools/borrow.js";
import { getPositionsTool } from "./tools/get-positions.js";
import { lendTool } from "./tools/lend.js";
import { poolStatsTool } from "./tools/pool-stats.js";
import { removeCollateralTool } from "./tools/remove-collateral.js";
import { repayTool } from "./tools/repay.js";

async function main() {
	console.log("🚀 Initializing BAMM MCP Server...");

	const server = new FastMCP({
		name: "BAMM MCP Server",
		version: "0.0.1",
	});

	server.addTool(addCollateralTool);
	server.addTool(borrowTool);
	server.addTool(getPositionsTool);
	server.addTool(lendTool);
	server.addTool(poolStatsTool);
	server.addTool(removeCollateralTool);
	server.addTool(repayTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ BAMM MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log(
			"   Try using tools like ADD_COLLATERAL, BORROW, or GET_POSITIONS!",
		);
	} catch (error) {
		console.error("❌ Failed to start BAMM MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the BAMM MCP Server:",
		error,
	);
	process.exit(1);
});
