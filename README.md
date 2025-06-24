# MCP-BAMM: Model Context Protocol Server for Borrow Automated Market Maker

This project implements a Model Context Protocol (MCP) server to interact with Borrow Automated Market Maker (BAMM) contracts on the Fraxtal blockchain. It allows MCP-compatible clients (like AI assistants, IDE extensions, or custom applications) to manage BAMM positions, borrow against LP tokens, and perform other operations related to the BAMM protocol.

<a href="https://glama.ai/mcp/servers/@IQAIcom/mcp-bamm">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@IQAIcom/mcp-bamm/badge" alt="MCP-BAMM MCP server" />
</a>

This server is built using TypeScript and `fastmcp`.

## Features (MCP Tools)

The server exposes the following tools that MCP clients can utilize:

- **`ADD_COLLATERAL`**: Add collateral to your BAMM position.

  - Parameters: `bammAddress` (string), `amount` (string), `collateralToken` (string, optional), `collateralTokenSymbol` (string, optional)
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `{ "txHash": "0x..." }`
  - Example Error: `Error: Either collateralToken or collateralTokenSymbol is required`

- **`BORROW`**: Borrow tokens from a BAMM position.

  - Parameters: `bammAddress` (string), `amount` (string), `borrowToken` (string, optional), `borrowTokenSymbol` (string, optional)
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `{ "txHash": "0x..." }`
  - Example Error: `Error: Borrow amount must be greater than 0`

- **`REPAY`**: Repay borrowed tokens to a BAMM position.

  - Parameters: `bammAddress` (string), `amount` (string), `borrowToken` (string, optional), `borrowTokenSymbol` (string, optional)
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `{ "txHash": "0x..." }`
  - Example Error: `Error: Repay amount must be greater than 0`

- **`LEND`**: Lend Fraxswap LP tokens to a BAMM contract.

  - Parameters: `bammAddress` (string), `amount` (string)
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `{ "txHash": "0x..." }`
  - Example Error: `Error: Lend amount must be greater than 0`

- **`WITHDRAW`**: Withdraw LP tokens from a BAMM contract by redeeming BAMM tokens.

  - Parameters: `bammAddress` (string), `amount` (string)
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `{ "txHash": "0x..." }`
  - Example Error: `Error: Withdraw amount must be greater than 0`

- **`REMOVE_COLLATERAL`**: Remove collateral from your BAMM position.

  - Parameters: `bammAddress` (string), `amount` (string), `collateralToken` (string, optional), `collateralTokenSymbol` (string, optional)
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `{ "txHash": "0x..." }`
  - Example Error: `Error: Remove collateral amount must be greater than 0`

- **`GET_POSITIONS`**: Get all your active BAMM positions.

  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `📊 *Your Active BAMM Positions*\n\n**💰 BAMM Position**\n- bamm: 0x...\n- Pair: 0x...\n- FRAX: 100\n- USDC: 200\n- rented: 0`
  - Example Error: `❌ Failed to retrieve positions: Failed to fetch pool details: Not Found`

- **`POOL_STATS`**: Get statistics for all BAMM pools.
  - Requires `WALLET_PRIVATE_KEY` in the environment.
  - Example Response: `Pool Stats: ...`
  - Example Error: `Error: Pool stats not available`

## Prerequisites

- Node.js (v18 or newer recommended)
- pnpm

## Installation

There are a few ways to use `mcp-bamm`:

**1. Using `pnpm dlx` (Recommended for most MCP client setups):**

You can run the server directly using `pnpm dlx` without needing a global installation. This is often the easiest way to integrate with MCP clients.

**2. Global Installation from npm (via pnpm):**

Install the package globally to make the `mcp-bamm` command available system-wide:

```bash
pnpm add -g mcp-bamm
```

**3. Building from Source (for development or custom modifications):**

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/mcp-bamm.git
   cd mcp-bamm
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up your wallet private key:**

   Set the `WALLET_PRIVATE_KEY` environment variable with your wallet's private key (without 0x prefix):

   ```bash
   export WALLET_PRIVATE_KEY=your_private_key_here
   ```

   For persistent configuration, add this to your shell profile or use a `.env` file (make sure to add the `.env` file to `.gitignore`).

4. **Build the project:**

   ```bash
   pnpm run build
   ```

5. **Start the server:**

   ```bash
   pnpm run start
   ```

## Configuration (Environment Variables)

This MCP server requires certain environment variables to be set by the MCP client that runs it. These are typically configured in the client's MCP server definition (e.g., in a `mcp.json` file for Cursor, or similar for other clients).

- **`WALLET_PRIVATE_KEY`**: (Required for all blockchain operations)
  - The private key of the wallet to be used for interacting with BAMM contracts (signing transactions for lending, borrowing, etc.).
  - **Security Note:** Handle this private key with extreme care. Ensure it is stored securely and only provided to trusted MCP client configurations.

## Running the Server with an MCP Client

MCP clients (like AI assistants, IDE extensions, etc.) will run this server as a background process. You need to configure the client to tell it how to start your server. Below is an example configuration snippet that an MCP client might use (e.g., in a `mcp_servers.json` or similar configuration file). This example shows how to run the server using the published npm package via `pnpm dlx`.

```json
{
  "mcpServers": {
    "bamm-mcp-server": {
      "command": "pnpm",
      "args": ["dlx", "mcp-bamm"],
      "env": {
        "WALLET_PRIVATE_KEY": "your_wallet_private_key_here"
      }
    }
  }
}
```

**Alternative if Globally Installed:**
If you have installed `mcp-bamm` globally (`pnpm add -g mcp-bamm`), you can simplify the `command` and `args`:

```json
{
  "mcpServers": {
    "bamm-mcp-server": {
      "command": "mcp-bamm",
      "args": [],
      "env": {
        "WALLET_PRIVATE_KEY": "your_wallet_private_key_here"
      }
    }
  }
}
```

- **`command`**: The executable to run.
  - For `pnpm dlx`: `"pnpm"` (with `"dlx"` as the first arg)
  - For global install: `"mcp-bamm"`
- **`args`**: An array of arguments to pass to the command.
  - For `pnpm dlx`: `["dlx", "mcp-bamm"]`
  - For global install: `[]`
- **`env`**: An object containing environment variables to be set when the server process starts. This is where you provide `WALLET_PRIVATE_KEY`.

## Example Usage

Using an MCP client, you can perform operations like:

```javascript
// First, ensure the WALLET_PRIVATE_KEY environment variable is set on the server

// Add collateral to a BAMM position
await client.runTool("ADD_COLLATERAL", {
  bammAddress: "0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84",
  amount: "100",
  collateralTokenSymbol: "FRAX",
});

// Get all your positions
await client.runTool("GET_POSITIONS", {});
```

## Development

- `pnpm run build`: Compiles TypeScript to JavaScript in `dist/` and makes the output executable.
- `pnpm run dev`: Runs the server in development mode using `tsx` (hot-reloading for TypeScript).
- `pnpm run start`: Runs the built server (from `dist/`) using Node.
- `pnpm run lint`: Lints the codebase using Biome.
- `pnpm run format`: Formats the codebase using Biome.