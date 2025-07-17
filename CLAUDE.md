# MCP CLI - Contributor Documentation

This document provides guidance for contributors to the MCP CLI project. It explains the architecture, key concepts, and how to extend the functionality.

## Project Overview

MCP CLI is a command-line interface built with NestJS and Commander.js that makes it easy to create and run Model Context Protocol (MCP) servers. The CLI provides a simple way to start an MCP server that can expose resources, tools, and prompts to LLM clients.

## Architecture

The project follows a modular architecture based on NestJS:

```
src/
├── commands/           # CLI commands using Commander.js
│   ├── command.factory.ts      # Registers and executes commands
│   ├── commands.module.ts      # NestJS module for commands
│   └── create-server.command.ts # Implementation of the create-server command
├── mcp/               # MCP server implementation
│   ├── mcp.module.ts           # NestJS module for MCP functionality
│   ├── mcp-server.service.ts   # Service for creating and managing MCP servers
│   ├── resources.service.ts    # Service for registering resources
│   ├── tools.service.ts        # Service for registering tools
│   └── prompts.service.ts      # Service for registering prompts
└── main.ts            # Entry point
```

## Key Concepts

### MCP Server

The Model Context Protocol (MCP) server is the core component that handles communication with LLM clients. It exposes:

1. **Resources**: Data that can be loaded into an LLM's context
2. **Tools**: Functions that can be called by the LLM to perform actions
3. **Prompts**: Templates for LLM interactions

### NestJS Integration

The project uses NestJS for dependency injection and modular organization. Each major feature is encapsulated in its own module and service.

### CLI Commands

Commands are implemented using Commander.js and integrated with NestJS through the `CommandFactory`.

## How to Add New Features

### Adding a New Command

To add a new CLI command:

1. Create a new command class in the `commands` directory:

```typescript
import { Injectable } from '@nestjs/common';

interface NewCommandOptions {
  // Define command options here
}

@Injectable()
export class NewCommand {
  constructor(/* inject dependencies */) {}

  async execute(options: NewCommandOptions): Promise<void> {
    // Implement command logic
  }
}
```

2. Register the command in `commands.module.ts`:

```typescript
@Module({
  imports: [/* required modules */],
  providers: [
    CommandFactory,
    CreateServerCommand,
    NewCommand, // Add your new command here
  ],
  exports: [CommandFactory],
})
export class CommandsModule {}
```

3. Add the command to `command.factory.ts`:

```typescript
constructor(
  private readonly createServerCommand: CreateServerCommand,
  private readonly newCommand: NewCommand, // Inject your new command
) {}

async execute(): Promise<void> {
  // ...existing code...

  program
    .command('new-command')
    .description('Description of your new command')
    .option('-o, --option <value>', 'Description of option')
    .action(async (options) => {
      await this.newCommand.execute(options);
    });

  // ...existing code...
}
```

### Adding a New Resource

To add a new resource:

1. Create a new method in `resources.service.ts`:

```typescript
private registerNewResource(server: McpServer): void {
  server.registerResource(
    'resource-name',
    'resource-scheme://path', // Or use ResourceTemplate for dynamic resources
    {
      title: 'Resource Title',
      description: 'Resource description',
    },
    async (uri, params) => ({
      contents: [{
        uri: uri.href,
        text: 'Resource content',
      }],
    })
  );
}
```

2. Call your method from `registerResources()`:

```typescript
registerResources(server: McpServer): void {
  this.registerStaticResource(server);
  this.registerDynamicResource(server);
  this.registerNewResource(server); // Add your new resource
}
```

### Adding a New Tool

To add a new tool:

1. Create a new method in `tools.service.ts`:

```typescript
private registerNewTool(server: McpServer): void {
  server.registerTool(
    'tool-name',
    {
      title: 'Tool Title',
      description: 'Tool description',
      inputSchema: {
        param1: z.string(),
        param2: z.number(),
      },
    },
    async ({ param1, param2 }) => {
      // Implement tool logic
      return {
        content: [{ type: 'text', text: 'Tool result' }],
      };
    }
  );
}
```

2. Call your method from `registerTools()`:

```typescript
registerTools(server: McpServer): void {
  this.registerCalculatorTool(server);
  this.registerTextProcessingTool(server);
  this.registerNewTool(server); // Add your new tool
}
```

### Adding a New Prompt

To add a new prompt:

1. Create a new method in `prompts.service.ts`:

```typescript
private registerNewPrompt(server: McpServer): void {
  server.registerPrompt(
    'prompt-name',
    {
      title: 'Prompt Title',
      description: 'Prompt description',
      argsSchema: {
        param1: z.string(),
        param2: z.number(),
      },
    },
    ({ param1, param2 }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Prompt template with ${param1} and ${param2}`,
        },
      }],
    })
  );
}
```

2. Call your method from `registerPrompts()`:

```typescript
registerPrompts(server: McpServer): void {
  this.registerGreetingPrompt(server);
  this.registerCompletablePrompt(server);
  this.registerNewPrompt(server); // Add your new prompt
}
```

## Advanced Features

### Completable Arguments

MCP supports argument completions to help users fill in prompt arguments. Use the `completable` function to define completion logic:

```typescript
argsSchema: {
  parameter: completable(z.string(), (value, context) => {
    // Return an array of suggestions based on the current value
    return ['suggestion1', 'suggestion2'].filter(s => s.startsWith(value));
  }),
}
```

### Dynamic Resources

For resources with parameters, use `ResourceTemplate`:

```typescript
server.registerResource(
  'dynamic',
  new ResourceTemplate('scheme://{param1}/{param2}', { 
    list: undefined,
    complete: {
      param1: (value) => ['option1', 'option2'].filter(o => o.startsWith(value)),
      param2: (value, context) => {
        // Context-aware completions
        if (context?.arguments?.param1 === 'option1') {
          return ['sub1', 'sub2'].filter(s => s.startsWith(value));
        }
        return ['other'].filter(o => o.startsWith(value));
      }
    }
  }),
  { title: 'Dynamic Resource' },
  async (uri, { param1, param2 }) => ({
    contents: [{
      uri: uri.href,
      text: `Content for ${param1}/${param2}`,
    }],
  })
);
```

### Error Handling

Tools can return errors by setting the `isError` flag:

```typescript
return {
  content: [{ type: 'text', text: 'Error message' }],
  isError: true,
};
```

## Testing

To test your contributions:

1. Build the project:
   ```
   npm run build
   ```

2. Run the CLI:
   ```
   node dist/main.js create-server
   ```

3. Test with an MCP client like the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

## Best Practices

1. **Modularity**: Keep each feature in its own service and method
2. **Documentation**: Add JSDoc comments to explain your code
3. **Error Handling**: Properly handle errors and provide meaningful messages
4. **Type Safety**: Use TypeScript types and Zod schemas for validation
5. **Testing**: Add tests for new functionality

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
