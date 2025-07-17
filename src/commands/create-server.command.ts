import { Injectable } from '@nestjs/common';
import { McpServerService } from '../mcp/mcp-server.service';

interface ServerOptions {
  name: string;
  version: string;
  transport: 'stdio' | 'http';
  port?: number;
}

@Injectable()
export class CreateServerCommand {
  constructor(private readonly mcpServerService: McpServerService) {}

  async execute(options: ServerOptions): Promise<void> {
    console.log(`Creating MCP server: ${options.name} v${options.version}`);
    console.log(`Transport: ${options.transport}${options.port ? ` on port ${options.port}` : ''}`);
    
    try {
      await this.mcpServerService.createAndStartServer({
        name: options.name,
        version: options.version,
        transport: options.transport,
        port: options.port,
      });
      
      if (options.transport === 'stdio') {
        console.log('MCP server started successfully. Listening on stdio...');
      } else {
        console.log(`MCP server started successfully. Listening on http://localhost:${options.port}/mcp`);
      }
      console.log('Press Ctrl+C to stop the server.');
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      process.exit(1);
    }
  }
}
