import {Injectable, Logger} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { SExpression, Atom, List } from './parser.service';

interface GraphQLResponse {
  data?: {
    getJSX?: {
      id: string;
      sha: string;
      nonce: string;
      jsx: string;
      mdx: string;
    };
  };
  errors?: Array<{ message: string }>;
}

interface CacheEntry {
  content: string;
  timestamp: number;
  sha?: string;
}

/**
 * Renderer service converts S-expressions to template content
 * Supports local filesystem, in-memory cache, and GraphQL API sources
 * Requirement: Convert parsed S-expressions into file content for processing
 */
@Injectable()
export class RendererService {
  private cache = new Map<string, CacheEntry>();
  private readonly graphqlUrl: string;
  private readonly cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.graphqlUrl = process.env.GRAPHQL_API_URL || '';
    if (!this.graphqlUrl) {
      console.warn('GRAPHQL_API_URL environment variable not set. GraphQL features will be disabled.');
    }
  }
  /**
   * Render an S-expression by loading and concatenating files
   */
  async render(expression: SExpression, basePath: string = process.cwd()): Promise<string> {
    if (expression.type === 'atom') {
      return this.renderAtom(expression as Atom, basePath);
    } else {
      return this.renderList(expression as List, basePath);
    }
  }

  private async renderAtom(atom: Atom, basePath: string): Promise<string> {
    const id = atom.value;
    
    // Step 1: Check local cache first
    const cachedContent = this.getCachedContent(id);
    if (cachedContent) {
      return cachedContent;
    }

    // Step 4: Fallback handling (existing behavior)
    if (id.startsWith('fallback-')) {
      return `<!-- Fallback content for ${id} -->
This is a fallback template that would normally be replaced with actual content.
Template path: ${id}
Base path: ${basePath}`;
    }
    // Step 3: Try GraphQL API if filesystem fails
    if (this.graphqlUrl) {
      try {
        const content = await this.fetchFromGraphQL(id);
        if (content) {
          // Cache API content for future use
          this.setCachedContent(id, content);
          return content;
        }
      } catch (error) {
        console.warn(`GraphQL API request failed for ${id}:`, error.message);
        // Continue to fallback handling
      }
    }

    // Step 2: Try filesystem (existing behavior)
    try {
      const filePath = join(basePath, id);
      const content = await fs.readFile(filePath, 'utf-8');
      // Cache filesystem content for future use
      this.setCachedContent(id, content);
      return content;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error; // Re-throw non-file-not-found errors
      }
    }
    
    


    
    throw new Error(`Template not found: ${id} (checked cache, filesystem, and GraphQL API)`);
  }
  private getAuthToken() {
    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RhdGF3aG9yZS5ob3VzZS8iLCJzdWIiOiJhNDBiOGVkZC0wZWQzLTRjZmUtOTk4ZC1mYzllMWMwNzIyZjMiLCJvd25lcklkIjpudWxsLCJ1c2VySWQiOiI3Y2ViMGY1Ny1jYmE0LTQ3MzEtYWYzZC1lYTEzMmNjMTllY2UiLCJ2aWV3SWQiOiJhNDBiOGVkZC0wZWQzLTRjZmUtOTk4ZC1mYzllMWMwNzIyZjMiLCJqdGkiOiI0MDdlMGU4OC1mOTE3LTQ1MTAtYWNmZS01Y2Y2ZjY3MWZiZGQiLCJpYXQiOjE3NTUzMDc0MDQsImV4cCI6MTc1NTMxMTAwNH0.lek-xABfzAfwflMs4oB5iM9jYphtsZ04mVB4lKW91lY';
  }
  /**
   * Get content from cache if valid and not expired
   */
  private getCachedContent(id: string): string | null {
    const entry = this.cache.get(id);
    if (!entry) {
      return null;
    }
    
    const isExpired = Date.now() - entry.timestamp > this.cacheExpiryMs;
    if (isExpired) {
      this.cache.delete(id);
      return null;
    }
    
    return entry.content;
  }

  /**
   * Set content in cache with current timestamp
   */
  private setCachedContent(id: string, content: string, sha?: string): void {
    this.cache.set(id, {
      content,
      timestamp: Date.now(),
      sha,
    });
  }

  /**
   * Fetch content from GraphQL API
   * TODO: Add authentication when auth requirements are implemented
   */
  private async fetchFromGraphQL(id: string): Promise<string | null> {
    const query = `{getMDX getJSX(id: "${id}") { id sha nonce mdx}}`;

    // TODO: Add authentication headers when auth system is implemented
    // This might require:
    // - User login flow
    // - Token storage and refresh
    // - Interactive prompts for credentials
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-application-name': 'undefined',
    'x-manifest-version': 'v294',
    'x-viewer-id': 'a40b8edd-0ed3-4cfe-998d-fc9e1c0722f3',
      'Authorization': `Whore ${await this.getAuthToken()}`, // Future auth implementation
    };
    // const t = await fetch("https://sparklestheunicornf.art/graphql", {
    //   "body": "{\"variables\":{},\"query\":\"{\\n  getJSX(id: \\\"0e83e94d-35b2-415a-a187-5739f4abaed9\\\") {\\n    id\\n    sha\\n    nonce\\n    jsx\\n    mdx\\n    __typename\\n  }\\n}\"}",
    //   "cache": "default",
    //   "credentials": "include",
    //   "headers": {
    //     "Accept": "*/*",
    //     "Accept-Language": "en-US,en;q=0.9",
    //     "Authorization": "Whore eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RhdGF3aG9yZS5ob3VzZS8iLCJzdWIiOiJhNDBiOGVkZC0wZWQzLTRjZmUtOTk4ZC1mYzllMWMwNzIyZjMiLCJvd25lcklkIjpudWxsLCJ1c2VySWQiOiI3Y2ViMGY1Ny1jYmE0LTQ3MzEtYWYzZC1lYTEzMmNjMTllY2UiLCJ2aWV3SWQiOiJhNDBiOGVkZC0wZWQzLTRjZmUtOTk4ZC1mYzllMWMwNzIyZjMiLCJqdGkiOiI0MDdlMGU4OC1mOTE3LTQ1MTAtYWNmZS01Y2Y2ZjY3MWZiZGQiLCJpYXQiOjE3NTUzMDc0MDQsImV4cCI6MTc1NTMxMTAwNH0.lek-xABfzAfwflMs4oB5iM9jYphtsZ04mVB4lKW91lY",
    //     "Content-Type": "application/json",
    //     "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15",
    //     "x-application-name": "undefined",
    //     "x-manifest-version": "v294",
    //     "x-viewer-id": "a40b8edd-0ed3-4cfe-998d-fc9e1c0722f3"
    //   },
    //   "method": "POST",
    //   "mode": "cors",
    //   "redirect": "follow",
    //   "referrer": "https://sparklestheunicornf.art/service-worker.js",
    //   "referrerPolicy": "no-referrer-when-downgrade"
    // })
    const req = {
      method: 'POST',
      headers,
      body: JSON.stringify({query}),
    };
    // new Logger().verbose(await t.json())
    try {
      new Logger().verbose({thisgraphqlUrl: this.graphqlUrl, req});
      const response = await fetch(this.graphqlUrl, req);
      new Logger.error(response);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse = await response.json();
      console.dir(result)
      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }
      // new Logger().error(result);
      const data = result.data?.getJSX;
      if (!data) {
        new Logger().verbose('returning null')
        return null; // No data found for this ID
      }

      // Prefer JSX content, fall back to MDX
      const content = data.jsx || data.mdx || '';

      // Cache with SHA for future validation if needed
      this.setCachedContent(id, content, data.sha);

      return content;
    } catch (error) {
      new Logger.error(`GraphQL error: ${error}`);
      throw new Error(`GraphQL request failed: ${error.message}`);
    }


  }

  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; entries: Array<{ id: string; timestamp: number; sha?: string }> } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([id, entry]) => ({
        id,
        timestamp: entry.timestamp,
        sha: entry.sha,
      })),
    };
  }

  private async renderList(list: List, basePath: string): Promise<string> {
    const contents: string[] = [];
    
    for (const element of list.elements) {
      const content = await this.render(element, basePath);
      contents.push(content);
    }
    
    return contents.join('\n\n');
  }
}
