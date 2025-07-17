# Git Commit Guidelines for MCP CLI

This document provides guidelines for creating git commits for the MCP CLI project.

## Conventional Commits

We use the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This leads to more readable messages that are easy to follow when looking through the project history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Scope

The scope should be the name of the module affected (as perceived by the person reading the changelog).

### Subject

The subject contains a succinct description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

## Prompt for Updating Commit Script

To update the commit script in the future, add this file to the context of an empty chat with Claude and use the following prompt:

```
This is a Model Context Protocol (MCP) CLI project. I need to update my git commit script to handle new changes.

The project structure follows a modular NestJS architecture with:
- Commands module for CLI commands
- MCP module for server implementation with resources, tools, and prompts

Please update the commit.sh script to create a series of git commits with clean conventional messages. Break changes up by purpose based on the documentation. Don't commit everything in one big WIP commit.

The script should:
1. Create logical groupings of related changes
2. Use conventional commit format
3. Include descriptive messages that explain why changes were made
4. Handle new files appropriately
```

This prompt will help Claude understand the context and generate an appropriate updated commit script.
