import { Injectable } from '@nestjs/common';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Service responsible for registering resources with the MCP server
 */
@Injectable()
export class ResourcesService {
  /**
   * Register all resources with the MCP server
   * 
   * @param server The MCP server instance
   */
  registerResources(server: McpServer): void {
    // Register a static resource
    this.registerStaticResource(server);
    
    // Register a dynamic resource with parameters
    this.registerDynamicResource(server);
    
    // Add more resources here as needed
  }

  /**
   * Register a static resource
   * 
   * @param server The MCP server instance
   */
  private registerStaticResource(server: McpServer): void {
    server.registerResource(
      'info',
      'info://server',
      {
        title: 'Server Information',
        description: 'Basic information about this MCP server',
        mimeType: 'text/plain',
      },
      async (uri) => ({
        contents: [{
          uri: uri.href,
          text: 'This is a basic MCP server created with mcp-cli.\n\n' +
                'You can extend it by adding more resources, tools, and prompts.',
        }],
      })
    );
  }

  /**
   * Register a dynamic resource with parameters
   * 
   * @param server The MCP server instance
   */
  private registerDynamicResource(server: McpServer): void {
    server.registerResource(
      'echo',
      new ResourceTemplate('echo://{message}', { list: undefined }),
      {
        title: 'Echo Resource',
        description: 'Echoes back the provided message as a resource',
      },
      async (uri, { message }) => ({
        contents: [{
          uri: uri.href,
          text: `Echo: ${message}`,
        }],
      })
    );
  }

  /**
   * Example of how to add a new resource
   * 
   * To add a new resource:
   * 1. Create a new private method in this class
   * 2. Implement the resource logic
   * 3. Call the method from registerResources()
   * 
   * @example
   * private registerCustomResource(server: McpServer): void {
   *   server.registerResource(
   *     'custom',
   *     'custom://resource',
   *     {
   *       title: 'Custom Resource',
   *       description: 'A custom resource example',
   *     },
   *     async (uri) => ({
   *       contents: [{
   *         uri: uri.href,
   *         text: 'Custom resource content',
   *       }],
   *     })
   *   );
   * }
   */
}
