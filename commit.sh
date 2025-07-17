#!/bin/bash

# Conventional commit types:
# feat:     A new feature
# fix:      A bug fix
# docs:     Documentation only changes
# style:    Changes that do not affect the meaning of the code
# refactor: A code change that neither fixes a bug nor adds a feature
# perf:     A code change that improves performance
# test:     Adding missing tests or correcting existing tests
# build:    Changes that affect the build system or external dependencies
# ci:       Changes to our CI configuration files and scripts
# chore:    Other changes that don't modify src or test files

# Initialize the repository if not already initialized
if [ ! -d .git ]; then
  git init
  echo "Git repository initialized"
fi

# Function to stage files and create a commit
commit_changes() {
  local message="$1"
  local files="${@:2}"
  
  # Stage the specified files
  git add $files
  
  # Create the commit
  git commit -m "$message"
  
  echo "Created commit: $message"
}

echo "Starting commit sequence..."

# 1. Initial project setup (configuration files)
commit_changes "build: initialize NestJS project structure" \
  .gitignore tsconfig.json nest-cli.json package.json package-lock.json

# 2. Core application structure
commit_changes "feat(core): add basic application module structure" \
  src/app.module.ts src/main.ts

# 3. MCP module implementation
commit_changes "feat(mcp): implement MCP server service" \
  src/mcp/mcp.module.ts src/mcp/mcp-server.service.ts

# 4. Resources implementation
commit_changes "feat(resources): add resource registration service" \
  src/mcp/resources.service.ts

# 5. Tools implementation
commit_changes "feat(tools): add tool registration service" \
  src/mcp/tools.service.ts

# 6. Prompts implementation
commit_changes "feat(prompts): add prompt registration service" \
  src/mcp/prompts.service.ts

# 7. CLI commands implementation
commit_changes "feat(cli): implement command factory and create-server command" \
  src/commands/commands.module.ts src/commands/command.factory.ts src/commands/create-server.command.ts

# 8. Documentation
commit_changes "docs: add project documentation" \
  README.md CONTRIBUTING.md CLAUDE.md

# 9. Add license
commit_changes "docs: add AGPL-3.0 license" \
  LICENSE

# 10. Add git documentation
commit_changes "docs: add git commit guidelines" \
  GIT.md

# 11. Add commit script itself
commit_changes "build: add commit script" \
  commit.sh

echo "Commit sequence completed successfully!"
