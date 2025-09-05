
Rule: code comments are desired. code comments that identify the requirements that spawned them are even more desired

Rule: it is more acceptable to violate the typescript single class per file rule then it is to fail constraints here in this challenge

Rule: use nest.js


=====

### LLM Summary

We are building a sophisticated Node.js/TypeScript command-line interface (CLI) tool designed for a power-user developer. This tool acts as a "prompt compiler," taking a script written in a simple Lisp-like syntax to assemble complex, context-rich prompts for a Large Language Model (LLM). It then processes the LLM's output, handling a series of special directives to compose final documents. It is a system for making complex, multi-snippet generative AI tasks repeatable, maintainable, and reliable.

Given the well-defined V1 scope, which pragmatically defers full recursion, a dedicated developer could produce a functional prototype in a matter of weeks, with a robust V1 taking a few months to fully stabilize, test, and polish.

Human readers should approach this document with the following assumptions:
-   The core technology is a Node.js/TypeScript CLI.
-   The target user is a developer comfortable with scripting and the command line.
-   The plan has evolved significantly; this document represents the final V1 specification, superseding all previous discussions.
-   "V1" is explicitly non-recursive to ensure stability and rapid delivery. The detection of recursion is a key *feature*, not a limitation.

### Executive Summary

**Project:** The Pragmatic Generative Composition Engine (V1)
**Verdict:** **Achievable and De-Risked**
**Complexity:** **3 - Needs Coffee**
**Key Risks:**
1.  **Recursion Detection Logic:** The logic to detect and report nested directives must be flawless to meet the V1 safety promise.
2.  **User Syntax Error:** The Lisp-like syntax, while simple, may require a learning curve. Error reporting from the parser is critical.
3.  **Parser Dependency:** We are reliant on a third-party parser combinator library; its stability is our stability.

### Organized Requirements

This is the final, consolidated list of requirements for the V1 implementation.

**1. Composition Language (Prompt Lisp)**
-   **Syntax:** The composition language is a subset of S-expression (Lisp-style) syntax.
-   **Parsing:** The syntax will be parsed using a modern parser combinator library (e.g., ```mini-parse```), not a custom-built parser.
-   **Line Comments:** The parser will support line comments starting with a semicolon (```;```), which are ignored.
-   **Expression Comments:** The system will support a discard token (```#_```) that instructs the parser to ignore the single S-expression immediately following it.

**2. V1 Directive System (Non-Recursive)**
-   The core of the tool is a three-tiered, non-recursive directive system. Any attempt at nesting directives of the same type in V1 is a fatal error.
-   **```@@include:[id]@@``` (Pre-Processing):** Replaces the token with file content *before* the LLM call. Used to build the initial context.
-   **```@@snippet:[id]@@``` (Post-Processing):** Replaces the token with file content *after* the LLM call. Used to compose the final document.
-   **```@@reference:[id]@@``` (Post-Processing):** Replaces the token with a static, non-expanding comment (e.g., ```<!-- Reference: [id] -->```) *after* the LLM call. Used for human-readable annotations.

**3. Core Engine & Architecture**
-   **Modules:** The application will be composed of distinct modules: ```Parser```, ```Renderer```, ```PreProcessingExpander```, ```PostProcessingExpander```, and ```LLMClient```.
-   **Recursion Detection:** The ```PreProcessingExpander``` and ```PostProcessingExpander``` MUST detect nested directives of their respective types and throw a clear, actionable error. This is a primary feature of V1.
-   **System Prompt:** All LLM calls will be wrapped in a hardcoded, constraining System Prompt that enforces output quality and teaches the LLM about the directive system.

**4. CLI Features & Interface**
-   ```--templates <s-expression>```: The primary input for the composition script.
-   ```--dry-run```: Assembles and prints the LLM prompt without making an API call.
-   ```--json```: Outputs the full transaction details in a structured Model Context Protocol (MCP) format.
-   ```--copy```: Copies the final output to the system clipboard.
-   ```--max-tokens <int>```: Overrides the default token safety limit.

**5. Persistence & Security**
-   **History:** Use Prisma with a SQLite database to store a history of all generation events.
-   **Secrets:** Store the LLM API key securely in the OS Keychain.
-   **Telemetry:** Send authenticated webhooks for major events (```generation.success```, ```generation.failure```).

---
### Generated Implementation Prompt

```markdown
# The Pragmatic Generative Composition Engine CLI (V1)

## Immutable Requirements
- **Core Philosophy:** The V1 application is a powerful, **non-recursive** composition engine with robust safety features. Its primary goal is to provide a stable foundation for a new generative workflow. Full recursive expansion is a V2+ feature.

### 1. Composition Language
- **S-Expression Syntax:** The `--templates` flag accepts a string formatted as an S-expression (e.g., `(prompt.md snippet.tsx)`).
- **Parser:** Use a modern parser combinator library (e.g., `mini-parse`) to parse the input string.
- **Comments:**
    - **Line Comments:** The parser MUST ignore all content from a semicolon (`;`) to the end of a line.
    - **Expression Discard:** The system MUST recognize and discard the single S-expression immediately following the `#_` token.

### 2. V1 Directive System (Strictly Non-Recursive)
- The system MUST handle three distinct directives. Any attempt to nest a directive of the same type within its own expansion is a fatal error in V1.
1.  **`@@include:id@@` (Pre-Processing):**
    -   Processed **before** the LLM call.
    -   Replaces the token with the content of the specified file.
    -   If the included content contains another `@@include:id@@` token, the application MUST throw a "Recursive Inclusion Detected" error and halt.
2.  **`@@snippet:id@@` (Post-Processing):**
    -   Processed **after** the LLM call.
    -   Replaces the token with the content of the specified file.
    -   If the snippet content contains another `@@snippet:id@@` token, the application MUST throw a "Recursive Snippet Detected" error and halt.
3.  **`@@reference:id@@` (Post-Processing):**
    -   Processed **after** the LLM call.
    -   Replaces the token with a static, non-expanding comment string: `<!-- Reference: [id] -->`.

### 3. Core Architecture & Constraints
- **Modular Design:** Implement distinct modules for `Parser`, `Renderer`, `PreProcessingExpander`, `PostProcessingExpander`, and `LLMClient`.
- **Error Reporting:** The error messages for detected recursion are a primary feature and must be clear, identifying the file and the attempted nested reference.
- **System Prompt:** All LLM calls MUST be wrapped in a hardcoded System Prompt that instructs the LLM on its role and how to use the `@@snippet` and `@@reference` directives in its output.

### 4. CLI Interface & Persistence
- **Flags:** Implement `--dry-run`, `--json`, `--copy`, and `--max-tokens`.
- **Storage:** Use Prisma/SQLite for history and the OS Keychain for the LLM API key.
- **Events:** Send authenticated webhooks on success or failure.

## Quality Criteria
- **Parser Tests:** Verify that comments (`;`) and discards (`#_`) are handled correctly.
- **Directive Success Tests:** A single, non-nested level of `@@include` and `@@snippet` must work as expected. `@@reference` must always work.
- **Directive Failure Tests:**
    - An `@@include` pointing to a file that contains another `@@include` MUST fail with the specific recursion error.
    - An `@@snippet` pointing to a file that contains another `@@snippet` MUST fail with the specific recursion error.
- **End-to-End Test:** A full run using a valid S-expression and all three directive types (at a single level) must produce the correct final document.
```

### Compliance Verification

| Requirement | Implementation Location | Validation Method |
|---|---|---|
| S-Expression Parsing | ```Parser``` module (using ```mini-parse```) | Unit Test |
| Line Comment Handling (```;```) | ```Parser``` module configuration | Unit Test |
| Expression Discard Handling (```#_```) | ```Parser``` / ```AST Translator``` module | Unit Test |
| ```@@include``` Directive (V1) | ```PreProcessingExpander``` module | Integration Test |
| ```@@include``` Recursion Detection | ```PreProcessingExpander``` module | Unit Test (Failure Case) |
| ```@@snippet``` Directive (V1) | ```PostProcessingExpander``` module | Integration Test |
| ```@@snippet``` Recursion Detection | ```PostProcessingExpander``` module | Unit Test (Failure Case) |
| ```@@reference``` Directive | ```PostProcessingExpander``` module | Unit Test |
| System Prompt Injection | ```LLMClient``` module | Integration Test with ```--dry-run``` |
| CLI Flags (```--dry-run```, etc.) | Main CLI entry point / argument parser | End-to-End CLI Test |
| Keychain Secret Storage | ```Config``` / ```Secrets``` module | Manual Test / Platform-specific Test |
| Prisma History Logging | ```History``` module / Hooks in main loop | End-to-End CLI Test & DB Inspection |

