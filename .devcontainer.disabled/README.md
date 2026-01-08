# Dev Container Configuration

This project includes a devcontainer configuration for a consistent development environment.

## What's Included

- **Node.js 20** - Matches the runtime specified in `action.yml`
- **Git** - Required for the action to parse git tags
- **Pre-installed dependencies** - Runs `npm ci` on container creation
- **VS Code extensions**:
  - ESLint
  - Prettier
  - TypeScript
  - Jest

## Usage

1. Open the project in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
3. Wait for the container to build and dependencies to install
4. Start developing!

## Features

- **Consistent Environment**: Everyone uses the same Node.js version and tooling
- **No Local Setup**: No need to install Node.js, npm, or dependencies locally
- **Pre-configured**: ESLint, Prettier, and TypeScript are ready to use
- **Git Support**: Full git functionality for testing tag parsing

## Requirements

- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Docker Desktop (or compatible container runtime)

