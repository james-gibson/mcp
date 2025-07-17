# MCP CLI

A command-line interface for creating and running Model Context Protocol (MCP) servers.

## Overview

MCP CLI is a tool that makes it easy to create and run MCP servers that can expose resources, tools, and prompts to LLM clients. It's built with NestJS and Commander.js, and uses the official MCP TypeScript SDK.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-cli.git
cd mcp-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI globally (optional)
npm link
```

## Usage

### Creating a Basic MCP Server

```bash
# Using npx
npx mcp-cli create-server

# Or if globally linked
mcp-cli create-server
```

Options:
- `-n, --name <name>` - Server name (default: "example-server")
- `-v, --version <version>` - Server version (default: "1.0.0")

## Features

The basic MCP server includes:

### Resources
- Static server information resource
- Dynamic echo resource

### Tools
- Calculator tool (add, subtract, multiply, divide)
- Text processing tool (uppercase, lowercase, reverse, count)

### Prompts
- Greeting prompt
- Team greeting prompt with completable arguments

## Extending the CLI

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CLAUDE.md](./CLAUDE.md) for information on how to extend the CLI with new commands and MCP components.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [NestJS](https://nestjs.com/)
- [Commander.js](https://github.com/tj/commander.js)
