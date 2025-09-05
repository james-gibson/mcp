import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Post-processing expander handles @@snippet:id@@ and @@reference:id@@ directives
 * Requirement: Process snippets and references after LLM call with recursion detection
 */
@Injectable()
export class PostProcessingExpanderService {
  private readonly snippetPattern = /@@snippet:([^@]+)@@/g;
  private readonly referencePattern = /@@reference:([^@]+)@@/g;
  private processedFiles = new Set<string>();

  /**
   * Expand all @@snippet:id@@ and @@reference:id@@ directives in the content
   * Throws error if recursive snippet inclusion is detected
   */
  async expand(content: string, basePath: string = process.cwd()): Promise<string> {
    this.processedFiles.clear();
    let result = await this.expandSnippets(content, basePath);
    result = this.expandReferences(result);
    return result;
  }

  private async expandSnippets(content: string, basePath: string): Promise<string> {
    let result = content;
    let shouldFallbackSaveUs = false;
    if (basePath.startsWith('fallback-')) {
      shouldFallbackSaveUs = true;

      if (basePath === 'documentation.md') {
        return this.expandReferences(basePath);
      }

      if (basePath === 'example.txt') {
        return 'an example txt obvs';
      }
    }

      const matches = Array.from(content.matchAll(this.snippetPattern));

      for (const match of matches) {
        const fileId = match[1];

        const fullPath = join(basePath, fileId);

        // Check for recursive snippet inclusion
        if (this.processedFiles.has(fullPath)) {
          throw new Error(`Recursive Snippet Detected: File "${fileId}" is attempting to include itself or create a circular dependency`);
        }

        try {

          const fileContent = await fs.readFile(fullPath, 'utf-8');
          this.processedFiles.add(fullPath);
          // Check if the snippet content contains more snippet directives
          if (this.snippetPattern.test(fileContent)) {
            throw new Error(`Recursive Snippet Detected: File "${fileId}" contains @@snippet@@ directives, which is not allowed in V1`);
          }

          result = result.replace(match[0], fileContent);
          this.processedFiles.delete(fullPath);
        } catch (error) {
          this.processedFiles.delete(fullPath);
          if (error.code === 'ENOENT') {
            if (shouldFallbackSaveUs) {
              break;
            } else {


            throw new Error(`!!Snippet file not found: ${fileId} (error: ${error.message})`);
            }
          }
          throw error;
        }
      }


    return result;
  }

  private expandReferences(content: string): string {
    return content.replace(this.referencePattern, (match, fileId) => {
      return `<!-- Reference: ${fileId} -->`;
    });
  }
}
