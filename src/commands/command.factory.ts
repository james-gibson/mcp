import { Injectable } from '@nestjs/common';
import { Command } from 'commander';
import { CreateServerCommand } from './create-server.command';
import { TemplateProcessorCommand, TemplateProcessorOptions } from '../templating/template-processor.command';

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
    private readonly templateProcessorCommand: TemplateProcessorCommand,
  ) {}

  async execute(): Promise<void> {
    const program = new Command();

    program
      .name('mcp-cli')
      .description('CLI for creating Model Context Protocol servers and processing templates')
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

    // Register the template processing command
    // Requirement: CLI interface with --templates, --dry-run, --json, --copy, --max-tokens flags
    program
      .command('process-templates')
      .description('Process templates using S-expression syntax with directive expansion')
      .requiredOption('--templates <s-expression>', 'S-expression defining template composition (e.g., "(prompt.md snippet.tsx)")')
      .option('--dry-run', 'Assemble and print the LLM prompt without making an API call', false)
      .option('--json', 'Output the full transaction details in structured format', false)
      .option('--copy', 'Copy the final output to the system clipboard', false)
      .option('--max-tokens <number>', 'Override the default token safety limit', parseInt)
      .action(async (options: TemplateProcessorOptions) => {
        const result = await this.templateProcessorCommand.execute(options);
        if (!result.success) {
          process.exit(1);
        }
      });

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
