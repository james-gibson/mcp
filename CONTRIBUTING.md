# Contributing to MCP CLI

Thank you for your interest in contributing to MCP CLI! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mcp-cli.git
   cd mcp-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

### Running the CLI in Development Mode

```bash
npm run start:dev
```

This will start the CLI in watch mode, automatically recompiling when you make changes.

### Testing Your Changes

```bash
npm test
```

## Project Structure

The project follows a modular architecture based on NestJS:

```
src/
├── commands/           # CLI commands using Commander.js
├── mcp/                # MCP server implementation
└── main.ts             # Entry point
```

For more detailed information about the architecture and how to extend it, see the [CLAUDE.md](./CLAUDE.md) file.

## Adding New Features

### Adding a New Command

1. Create a new command class in the `commands` directory
2. Register it in the `CommandsModule`
3. Add it to the `CommandFactory`

### Adding MCP Components

- **Resources**: Add methods to `ResourcesService`
- **Tools**: Add methods to `ToolsService`
- **Prompts**: Add methods to `PromptsService`

See [CLAUDE.md](./CLAUDE.md) for detailed examples.

## Code Style

- Follow the TypeScript coding conventions
- Use meaningful variable and function names
- Add JSDoc comments to explain your code
- Use NestJS decorators and patterns

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

By contributing to MCP CLI, you agree that your contributions will be licensed under the project's GNU Affero General Public License v3.0.
