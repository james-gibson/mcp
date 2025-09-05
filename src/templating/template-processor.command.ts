import { Injectable } from '@nestjs/common';
import { ParserService } from './parser.service';
import { RendererService } from './renderer.service';
import { PreProcessingExpanderService } from './pre-processing-expander.service';
import { PostProcessingExpanderService } from './post-processing-expander.service';

export interface TemplateProcessorOptions {
  templates: string;
  dryRun?: boolean;
  json?: boolean;
  copy?: boolean;
  maxTokens?: number;
}

export interface ProcessingResult {
  success: boolean;
  finalOutput?: string;
  error?: string;
  metadata?: {
    preProcessedContent: string;
    postProcessedContent: string;
    tokenCount?: number;
  };
}

/**
 * Template processor command handles the main templating workflow
 * Requirement: Implement the three-tiered directive system with S-expression parsing
 */
@Injectable()
export class TemplateProcessorCommand {
  constructor(
    private readonly parser: ParserService,
    private readonly renderer: RendererService,
    private readonly preProcessor: PreProcessingExpanderService,
    private readonly postProcessor: PostProcessingExpanderService,
  ) {}

  /**
   * Execute the template processing workflow
   */
  async execute(options: TemplateProcessorOptions): Promise<ProcessingResult> {
    try {
      // Step 1: Parse S-expression
      const expression = this.parser.parse(options.templates);
      
      // Step 2: Render templates to initial content
      const initialContent = await this.renderer.render(expression);
      
      // Step 3: Pre-processing - expand @@include@@ directives
      const preProcessedContent = await this.preProcessor.expand(initialContent);
      
      // Step 4: In a real implementation, this would call the LLM
      // For now, we'll simulate LLM processing by adding system prompt context
      const llmOutput = this.simulateLLMProcessing(preProcessedContent, options.maxTokens);
      
      // Step 5: Post-processing - expand @@snippet@@ and @@reference@@ directives
      const finalOutput = await this.postProcessor.expand(llmOutput);
      
      const result: ProcessingResult = {
        success: true,
        finalOutput,
        metadata: {
          preProcessedContent,
          postProcessedContent: finalOutput,
          tokenCount: this.estimateTokenCount(finalOutput),
        },
      };
      
      // Handle output options
      if (options.copy && finalOutput) {
        console.log('✓ Copy to clipboard functionality not yet implemented');
      }
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.dryRun) {
        console.log('=== DRY RUN - Pre-processed content (would be sent to LLM) ===');
        console.log(preProcessedContent);
        console.log('\n=== System Prompt Context ===');
        console.log(this.getSystemPrompt());
      } else {
        console.log(finalOutput);
      }
      
      return result;
      
    } catch (error) {
      const result: ProcessingResult = {
        success: false,
        error: error.message,
      };
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.error(`Error: ${error.message}`);
      }
      
      // Return the error result instead of exiting
      // The CLI framework will handle the exit code
      return result;
    }
  }

  /**
   * Simulate LLM processing with system prompt
   * In a real implementation, this would call an actual LLM API
   */
  private simulateLLMProcessing(content: string, maxTokens?: number): string {
    const systemPrompt = this.getSystemPrompt();
    
    // For simulation, we'll just return the content with some example directives
    // In a real implementation, this would be the LLM's response
    return `${content}

<!-- This is simulated LLM output (Don't keep the space between the @)-->
You can use the following directives in your output :
- @ @snippet:example.txt@@ to include file content
- @ @reference:documentation.md@@ to add a reference comment

Example usage: (Don't keep the space between the @)
<!--@ @snippet:example.txt@@-->
<!--@ @reference:docs/api.md@@-->
(Don't keep the space between the @)
@ @snippet:b9c379f9-f10c-4c56-8fd3-ef37301ba334@@
`;
  }

  /**
   * Get the system prompt that would be sent to the LLM
   * Requirement: System prompt teaches LLM about directive system
   */
  private getSystemPrompt(): string {
    return `You are a sophisticated document generation assistant. Your role is to process the provided content and generate high-quality output using the following directive system:

DIRECTIVE SYSTEM:
- @@snippet:id@@ - Use this to include the content of a file in your output. The file content will be inserted at this location after your response.
- @@reference:id@@ - Use this to add a reference comment. This will be replaced with <!-- Reference: id --> after your response.

IMPORTANT RULES:
- You can use @@snippet@@ and @@reference@@ directives in your output
- Do NOT use @@include@@ directives - those are for pre-processing only
- Keep your output focused and well-structured
- Use directives strategically to compose the final document

Your output will be post-processed to expand these directives into the final document.`;
  }

  /**
   * Estimate token count for the content
   */
  private estimateTokenCount(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }
}
