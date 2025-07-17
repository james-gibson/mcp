import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { completable } from '@modelcontextprotocol/sdk/server/completable.js';

/**
 * Service responsible for registering prompts with the MCP server
 */
@Injectable()
export class PromptsService {
  /**
   * Register all prompts with the MCP server
   * 
   * @param server The MCP server instance
   */
  registerPrompts(server: McpServer): void {
    // Register a simple greeting prompt
    this.registerGreetingPrompt(server);
    
    // Register a prompt with completable arguments
    this.registerCompletablePrompt(server);
    
    // Add more prompts here as needed
  }

  /**
   * Register a simple greeting prompt
   * 
   * @param server The MCP server instance
   */
  private registerGreetingPrompt(server: McpServer): void {
    server.registerPrompt(
      'greeting',
      {
        title: 'Greeting',
        description: 'Generate a greeting message',
        argsSchema: {
          name: z.string(),
          formal: z.string().optional(),
        },
      },
      ({ name, formal }) => ({
        messages: [{
          role: 'assistant',
          content: {
            type: 'text',
            text: formal === 'true' 
              ? `Good day, ${name}. How may I assist you today?`
              : `Hey ${name}! How can I help you?`,
          },
        }],
      })
    );
  }

  /**
   * Register a prompt with completable arguments
   * 
   * @param server The MCP server instance
   */
  private registerCompletablePrompt(server: McpServer): void {
    server.registerPrompt(
      'team-greeting',
      {
        title: 'Team Greeting',
        description: 'Generate a greeting for team members',
        argsSchema: {
          department: completable(z.string(), (value) => {
            // Department suggestions
            return ['engineering', 'sales', 'marketing', 'support']
              .filter(d => d.startsWith(value));
          }),
          name: completable(z.string(), (value, context) => {
            // Name suggestions based on selected department
            const department = context?.arguments?.['department'];
            if (department === 'engineering') {
              return ['Alice', 'Bob', 'Charlie'].filter(n => n.startsWith(value));
            } else if (department === 'sales') {
              return ['David', 'Eve', 'Frank'].filter(n => n.startsWith(value));
            } else if (department === 'marketing') {
              return ['Grace', 'Henry', 'Iris'].filter(n => n.startsWith(value));
            }
            return ['Guest'].filter(n => n.startsWith(value));
          }),
        },
      },
      ({ department, name }) => ({
        messages: [{
          role: 'assistant',
          content: {
            type: 'text',
            text: `Hello ${name}, welcome to the ${department} team!`,
          },
        }],
      })
    );
  }

  /**
   * Example of how to add a new prompt
   * 
   * To add a new prompt:
   * 1. Create a new private method in this class
   * 2. Implement the prompt logic
   * 3. Call the method from registerPrompts()
   * 
   * @example
   * private registerCustomPrompt(server: McpServer): void {
   *   server.registerPrompt(
   *     'custom-prompt',
   *     {
   *       title: 'Custom Prompt',
   *       description: 'A custom prompt example',
   *       argsSchema: {
   *         param1: z.string(),
   *         param2: z.number(),
   *       },
   *     },
   *     ({ param1, param2 }) => ({
   *       messages: [{
   *         role: 'user',
   *         content: {
   *           type: 'text',
   *           text: `Process this with ${param1} and ${param2}`,
   *         },
   *       }],
   *     })
   *   );
   * }
   */
}
