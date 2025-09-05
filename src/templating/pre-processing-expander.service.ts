import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Pre-processing expander handles @@include:id@@ directives
 * Requirement: Process includes before LLM call with recursion detection
 */
@Injectable()
export class PreProcessingExpanderService {
  private readonly includePattern = /@@include:([^@]+)@@/g;
  private processedFiles = new Set<string>();

  /**
   * Expand all @@include:id@@ directives in the content
   * Throws error if recursive inclusion is detected
   */
  async expand(content: string, basePath: string = process.cwd()): Promise<string> {
    this.processedFiles.clear();
    return this.expandRecursive(content, basePath);
  }

  private async expandRecursive(content: string, basePath: string): Promise<string> {
    let result = content;
    const matches = Array.from(content.matchAll(this.includePattern));
    
    for (const match of matches) {
      const fileId = match[1];
      const fullPath = join(basePath, fileId);
      
      // Check for recursive inclusion
      if (this.processedFiles.has(fullPath)) {
        throw new Error(`Recursive Inclusion Detected: File "${fileId}" is attempting to include itself or create a circular dependency`);
      }
      
      try {
        this.processedFiles.add(fullPath);
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        
        // Check if the included content contains more include directives
        if (this.includePattern.test(fileContent)) {
          throw new Error(`Recursive Inclusion Detected: File "${fileId}" contains @@include@@ directives, which is not allowed in V1`);
        }
        
        result = result.replace(match[0], fileContent);
        this.processedFiles.delete(fullPath);
      } catch (error) {
        this.processedFiles.delete(fullPath);
        if (error.code === 'ENOENT') {
          throw new Error(`Include file not found: ${fileId}`);
        }
        throw error;
      }
    }
    
    return result;
  }
}
