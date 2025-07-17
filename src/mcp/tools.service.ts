import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Service responsible for registering tools with the MCP server
 */
@Injectable()
export class ToolsService {
  /**
   * Register all tools with the MCP server
   * 
   * @param server The MCP server instance
   */
  registerTools(server: McpServer): void {
    // Register a simple calculator tool
    this.registerCalculatorTool(server);
    
    // Register a text processing tool
    this.registerTextProcessingTool(server);
    
    // Add more tools here as needed
  }

  /**
   * Register a calculator tool
   * 
   * @param server The MCP server instance
   */
  private registerCalculatorTool(server: McpServer): void {
    server.registerTool(
      'calculate',
      {
        title: 'Calculator',
        description: 'Perform basic arithmetic operations',
        inputSchema: {
          operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
          a: z.number(),
          b: z.number(),
        },
      },
      async ({ operation, a, b }) => {
        let result: number;
        
        switch (operation) {
          case 'add':
            result = a + b;
            break;
          case 'subtract':
            result = a - b;
            break;
          case 'multiply':
            result = a * b;
            break;
          case 'divide':
            if (b === 0) {
              return {
                content: [{ type: 'text', text: 'Error: Division by zero' }],
                isError: true,
              };
            }
            result = a / b;
            break;
        }
        
        return {
          content: [{ type: 'text', text: `Result: ${result}` }],
        };
      }
    );
  }

  /**
   * Register a text processing tool
   * 
   * @param server The MCP server instance
   */
  private registerTextProcessingTool(server: McpServer): void {
    server.registerTool(
      'text-process',
      {
        title: 'Text Processor',
        description: 'Process text with various operations',
        inputSchema: {
          operation: z.enum(['uppercase', 'lowercase', 'reverse', 'count']),
          text: z.string(),
        },
      },
      async ({ operation, text }) => {
        let result: string;
        
        switch (operation) {
          case 'uppercase':
            result = text.toUpperCase();
            break;
          case 'lowercase':
            result = text.toLowerCase();
            break;
          case 'reverse':
            result = text.split('').reverse().join('');
            break;
          case 'count':
            result = `Character count: ${text.length}`;
            break;
        }
        
        return {
          content: [{ type: 'text', text: result }],
        };
      }
    );
  }

  /**
   * Example of how to add a new tool
   * 
   * To add a new tool:
   * 1. Create a new private method in this class
   * 2. Implement the tool logic
   * 3. Call the method from registerTools()
   * 
   * @example
   * private registerCustomTool(server: McpServer): void {
   *   server.registerTool(
   *     'custom-tool',
   *     {
   *       title: 'Custom Tool',
   *       description: 'A custom tool example',
   *       inputSchema: {
   *         param1: z.string(),
   *         param2: z.number(),
   *       },
   *     },
   *     async ({ param1, param2 }) => {
   *       // Implement tool logic here
   *       return {
   *         content: [{ type: 'text', text: `Processed: ${param1}, ${param2}` }],
   *       };
   *     }
   *   );
   * }
   */
}
