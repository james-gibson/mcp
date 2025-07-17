import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { ResourcesService } from './resources.service';
import { ToolsService } from './tools.service';
import { PromptsService } from './prompts.service';
import * as express from 'express';
import { randomUUID } from 'crypto';

export interface ServerConfig {
  name: string;
  version: string;
  transport: 'stdio' | 'http';
  port?: number;
}

/**
 * Service responsible for creating and managing MCP servers
 */
@Injectable()
export class McpServerService {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly toolsService: ToolsService,
    private readonly promptsService: PromptsService,
  ) {}

  /**
   * Creates and starts an MCP server with the given configuration
   * 
   * @param config Server configuration
   * @returns Promise that resolves when the server is connected
   */
  async createAndStartServer(config: ServerConfig): Promise<void> {
    // Create the MCP server
    const server = new McpServer({
      name: config.name,
      version: config.version,
    });

    // Register resources, tools, and prompts
    this.resourcesService.registerResources(server);
    this.toolsService.registerTools(server);
    this.promptsService.registerPrompts(server);

    if (config.transport === 'stdio') {
      // Create a stdio transport
      const transport = new StdioServerTransport();
      
      // Connect the server to the transport
      await server.connect(transport);
    } else if (config.transport === 'http' && config.port) {
      // Set up HTTP server with Express
      await this.setupHttpServer(server, config.port);
    }
  }

  /**
   * Sets up an HTTP server for the MCP server
   * 
   * @param server The MCP server instance
   * @param port The port to listen on
   */
  private async setupHttpServer(server: McpServer, port: number): Promise<void> {
    try {
      // Dynamically import express to avoid dependency if not used
      const express = await import('express');
      const app = express.default();
      app.use(express.json());

      // Map to store transports by session ID
      const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

      // Handle POST requests for client-to-server communication
      app.post('/mcp', async (req, res) => {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
        } else if (!sessionId) {
          // New initialization request
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              // Store the transport by session ID
              transports[sessionId] = transport;
            },
            enableDnsRebindingProtection: true,
            allowedHosts: ['127.0.0.1', 'localhost'],
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              delete transports[transport.sessionId];
            }
          };

          // Connect to the MCP server
          await server.connect(transport);
        } else {
          // Invalid request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          });
          return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
      });

      // Reusable handler for GET and DELETE requests
      const handleSessionRequest = async (req: express.Request, res: express.Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !transports[sessionId]) {
          res.status(400).send('Invalid or missing session ID');
          return;
        }

        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
      };

      // Handle GET requests for server-to-client notifications via SSE
      app.get('/mcp', handleSessionRequest);

      // Handle DELETE requests for session termination
      app.delete('/mcp', handleSessionRequest);

      // Start the server
      app.listen(port, () => {
        console.log(`MCP HTTP Server listening on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to set up HTTP server:', error);
      throw error;
    }
  }
}
