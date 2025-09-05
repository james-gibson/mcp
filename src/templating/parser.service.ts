import { Injectable } from '@nestjs/common';

// S-expression AST node types
export interface SExpression {
  type: 'atom' | 'list';
}

export interface Atom extends SExpression {
  type: 'atom';
  value: string;
}

export interface List extends SExpression {
  type: 'list';
  elements: SExpression[];
}

/**
 * Parser for S-expressions with support for comments and discard tokens
 * Requirement: Parse S-expression syntax for template composition
 */
@Injectable()
export class ParserService {
  /**
   * Parse an S-expression string into an AST
   * Supports line comments (;) and expression discard (#_)
   */
  parse(input: string): SExpression {
    const tokens = this.tokenize(input);
    const { result } = this.parseExpression(tokens, 0);
    return result;
  }

  /**
   * Tokenize input string, removing comments and handling discard tokens
   */
  private tokenize(input: string): string[] {
    const lines = input.split('\n');
    const tokens: string[] = [];
    
    for (const line of lines) {
      // Remove line comments (everything after ;)
      const commentIndex = line.indexOf(';');
      const cleanLine = commentIndex >= 0 ? line.substring(0, commentIndex) : line;
      
      // Split on whitespace and parentheses
      const lineTokens = cleanLine
        .split(/(\s+|\(|\))/)
        .filter(token => token.trim().length > 0 && !/^\s+$/.test(token));
      
      tokens.push(...lineTokens);
    }
    
    return this.handleDiscardTokens(tokens);
  }

  /**
   * Handle #_ discard tokens by removing the following expression
   */
  private handleDiscardTokens(tokens: string[]): string[] {
    const result: string[] = [];
    let i = 0;
    
    while (i < tokens.length) {
      if (tokens[i] === '#_') {
        // Skip the discard token and the next expression
        i++; // Skip #_
        if (i < tokens.length) {
          i = this.skipExpression(tokens, i);
        }
      } else {
        result.push(tokens[i]);
        i++;
      }
    }
    
    return result;
  }

  /**
   * Skip over a complete expression starting at the given index
   */
  private skipExpression(tokens: string[], startIndex: number): number {
    if (startIndex >= tokens.length) return startIndex;
    
    if (tokens[startIndex] === '(') {
      // Skip list expression
      let depth = 1;
      let i = startIndex + 1;
      
      while (i < tokens.length && depth > 0) {
        if (tokens[i] === '(') depth++;
        else if (tokens[i] === ')') depth--;
        i++;
      }
      
      return i;
    } else {
      // Skip atom
      return startIndex + 1;
    }
  }

  /**
   * Parse a single expression from tokens starting at the given index
   */
  private parseExpression(tokens: string[], index: number): { result: SExpression; nextIndex: number } {
    if (index >= tokens.length) {
      throw new Error('Unexpected end of input');
    }
    
    const token = tokens[index];
    
    if (token === '(') {
      // Parse list
      const elements: SExpression[] = [];
      let i = index + 1;
      
      while (i < tokens.length && tokens[i] !== ')') {
        const { result, nextIndex } = this.parseExpression(tokens, i);
        elements.push(result);
        i = nextIndex;
      }
      
      if (i >= tokens.length) {
        throw new Error('Unclosed list expression');
      }
      
      return {
        result: { type: 'list', elements } as List,
        nextIndex: i + 1
      };
    } else if (token === ')') {
      throw new Error('Unexpected closing parenthesis');
    } else {
      // Parse atom
      return {
        result: { type: 'atom', value: token } as Atom,
        nextIndex: index + 1
      };
    }
  }
}
