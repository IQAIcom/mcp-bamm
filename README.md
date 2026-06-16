# BAMM MCP Server

[![npm version](https://img.shields.io/npm/v/@iqai/mcp-bamm.svg)](https://www.npmjs.com/package/@iqai/mcp-bamm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

The BAMM MCP Server enables AI agents to interact with Borrow Automated Market Maker (BAMM) contracts on the Fraxtal blockchain. This server provides comprehensive access to BAMM positions, lending, borrowing, and collateral management operations.

By implementing the Model Context Protocol (MCP), this server allows Large Language Models (LLMs) to manage BAMM positions, borrow against LP tokens, and perform other operations related to the BAMM protocol directly through their context window.

## Features

*   **Position Management**: View and manage your active BAMM positions across all pools.
*   **Lending Operations**: Lend Fraxswap LP tokens to BAMM contracts to earn yield.
*   **Borrowing**: Borrow tokens against your collateral from BAMM positions.
*   **Collateral Management**: Add or remove collateral from your BAMM positions.
*   **Pool Analytics**: Access statistics for all BAMM pools.

## Installation

### Using npx (Recommended)

To use this server without installing it globally:

```bash
npx @iqai/mcp-bamm
```

### Build from Source

```bash
git clone https://github.com/IQOfficial/mcp-bamm.git
cd mcp-bamm
pnpm install
pnpm run build
```

## Running with an MCP Client

Add the following configuration to your MCP client settings (e.g., `claude_desktop_config.json`).

### Minimal Configuration

```json
{
  "mcpServers": {
    "bamm": {
      "command": "npx",
      "args": ["-y", "@iqai/mcp-bamm"],
      "env": {
        "WALLET_PRIVATE_KEY": "your_wallet_private_key_here"
      }
    }
  }
}
```

### Advanced Configuration (Local Build)

```json
{
  "mcpServers": {
    "bamm": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-bamm/dist/index.js"],
      "env": {
        "WALLET_PRIVATE_KEY": "your_wallet_private_key_here"
      }
    }
  }
}
```

## Configuration (Environment Variables)

| Variable | Required | Description | Default |
| :--- | :--- | :--- | :--- |
| `WALLET_PRIVATE_KEY` | Yes | Private key of the wallet for signing transactions | - |

**Security Note:** Handle your private key with extreme care. Ensure it is stored securely and only provided to trusted MCP client configurations.

## Usage Examples

### Position Management
*   "What are my current BAMM positions?"
*   "Show me the stats for all BAMM pools."

### Lending & Borrowing
*   "Lend 100 LP tokens to the BAMM at address 0x..."
*   "Borrow 50 FRAX from my BAMM position."
*   "Repay 25 FRAX to my BAMM position."

### Collateral Operations
*   "Add 100 FRAX as collateral to my BAMM position."
*   "Remove 50 USDC collateral from my position."
*   "Withdraw my LP tokens from the BAMM."

## MCP Tools

<!-- AUTO-GENERATED TOOLS START -->

### `ADD_COLLATERAL`
Add collateral to your BAMM position

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bammAddress` | string | Yes | The address of the BAMM contract |
| `amount` | string | Yes | The amount of collateral to add |
| `collateralToken` | string |  | The address of the collateral token |
| `collateralTokenSymbol` | string |  | The symbol of the collateral token (e.g., 'IQT') |

### `BORROW`
Borrow tokens from a BAMM position

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bammAddress` | string | Yes | The address of the BAMM contract |
| `amount` | string | Yes | The amount to borrow |
| `borrowToken` | string |  | The address of the token to borrow |
| `borrowTokenSymbol` | string |  | The symbol of the token to borrow (e.g., 'IQT') |

### `LEND`
Lend Fraxswap LP tokens to a BAMM contract

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bammAddress` | string | Yes | The address of the BAMM contract |
| `amount` | string | Yes | The amount of LP tokens to lend |

### `REMOVE_COLLATERAL`
Remove collateral from your BAMM position

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bammAddress` | string | Yes | The address of the BAMM contract |
| `amount` | string | Yes | The amount of collateral to remove |
| `collateralToken` | string |  | The address of the collateral token |
| `collateralTokenSymbol` | string |  | The symbol of the collateral token (e.g., 'IQT') |

### `REPAY`
Repay borrowed tokens to a BAMM position

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bammAddress` | string | Yes | The address of the BAMM contract |
| `amount` | string | Yes | The amount to repay |
| `borrowToken` | string |  | The address of the token to repay |
| `borrowTokenSymbol` | string |  | The symbol of the token to repay (e.g., 'IQT') |

### `WITHDRAW`
Withdraw LP tokens from a BAMM contract by redeeming BAMM tokens

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bammAddress` | string | Yes | The address of the BAMM contract |
| `amount` | string | Yes | The amount of BAMM tokens to withdraw |

<!-- AUTO-GENERATED TOOLS END -->

## Development

### Build Project
```bash
pnpm run build
```

### Development Mode (Watch)
```bash
pnpm run watch
```

### Linting & Formatting
```bash
pnpm run lint
pnpm run format
```

### Project Structure
*   `src/tools/`: Individual tool definitions
*   `src/services/`: API client and business logic
*   `src/lib/`: Shared utilities
*   `src/index.ts`: Server entry point

## Resources

*   [BAMM Documentation](https://docs.frax.finance/frax-lending/bamm)
*   [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
*   [Fraxtal Network](https://frax.finance)

## Disclaimer

This project interacts with blockchain smart contracts and handles cryptocurrency transactions. Users should exercise caution, verify all data independently, and understand the risks involved in DeFi operations.

## License

[MIT](LICENSE)
