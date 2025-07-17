import { Injectable } from '@nestjs/common';
import { Command } from 'commander';
import { CreateServerCommand } from './create-server.command';

interface ServerOptions {
  name: string;
  version: string;
  transport: 'stdio' | 'http';
  port?: number;
}

@Injectable()
export class CommandFactory {
  private serverRunning = false;

  constructor(
    private readonly createServerCommand: CreateServerCommand,
  ) {}

  async execute(): Promise<void> {
    const program = new Command();

    program
      .name('mcp-cli')
      .description('CLI for creating Model Context Protocol servers')
      .version('0.1.0');

    // Register the create server command
    program
      .command('create-server')
      .description('Create and start a basic MCP server')
      .option('-n, --name <name>', 'Server name', 'example-server')
      .option('-v, --version <version>', 'Server version', '1.0.0')
      .option('-t, --transport <transport>', 'Transport type (stdio or http)', 'stdio')
      .option('-p, --port <port>', 'HTTP port (only used with http transport)', '3000')
      .action(async (options) => {
        const serverOptions: ServerOptions = {
          name: options.name,
          version: options.version,
          transport: options.transport === 'http' ? 'http' : 'stdio',
          port: options.transport === 'http' ? parseInt(options.port, 10) : undefined
        };
        
        this.serverRunning = true;
        await this.createServerCommand.execute(serverOptions);
      });

    // Add more commands here in the future

    // Parse command line arguments
    await program.parseAsync(process.argv);

    // If no command was specified, show help
    if (!process.argv.slice(2).length) {
      program.outputHelp();
    }
  }

  isServerRunning(): boolean {
    return this.serverRunning;
  }
}
