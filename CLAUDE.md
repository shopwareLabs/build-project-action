# Project: Shopware CLI Build Project Action

## Overview
This is a GitHub Action that builds Shopware projects using `shopware-cli` with automatic Composer dependency caching.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js 24 (ES modules)
- **Build Tool**: @vercel/ncc (bundles TypeScript directly)
- **Target**: GitHub Actions

## Project Structure
```
/
├── src/
│   ├── main.ts        # Main action entry point (runs during action)
│   ├── post.ts        # Post-action entry point (runs after main)
│   └── shared.ts      # Shared constants (state keys)
├── dist/
│   ├── main/
│   │   └── index.js   # Bundled main action
│   └── post/
│       └── index.js   # Bundled post action
├── action.yml         # GitHub Action definition
├── package.json       # Node.js dependencies
└── tsconfig.json      # TypeScript configuration
```

## Key Features
1. **Shopware CLI Integration**: Runs `shopware-cli project ci <path>`
2. **Composer Caching**: Automatically caches Composer dependencies
3. **State Management**: Uses GitHub Actions state to pass data between main and post actions
4. **Log Grouping**: Organized output with collapsible sections

## Build Process
```bash
npm run build          # Bundles both main.ts and post.ts
npm run typecheck      # Type checking without emit
npm run build:watch    # Development mode with type checking
```

## Action Inputs
- `path`: Project path to build (required, default: ".")
- `github-token`: GitHub token for authenticated operations (optional)
- `additional-composer-cache-key`: Additional cache key suffix (optional)

## How Caching Works
1. **Main Action** (`src/main.ts`):
   - Detects Composer cache directory via `composer config cache-files-dir`
   - Generates cache key from composer.lock/composer.json hash
   - Restores cache if available
   - Saves state for post-action
   - Runs `shopware-cli project ci`

2. **Post Action** (`src/post.ts`):
   - Retrieves state from main action
   - Saves Composer cache for future runs

## Cache Key Pattern
`composer-{platform}-{sha256-hash}[-{additional-key}]`

Example: `composer-linux-abc123def456-php-8.2`

## State Keys (Prefixed to avoid collisions)
- `shopware-cli-build__composer-cache-dir`
- `shopware-cli-build__cache-key`

## Important Implementation Details
- Uses `isFeatureAvailable()` to check if caching is available
- Handles cases where composer.lock doesn't exist (falls back to composer.json)
- Log messages use emojis for visual clarity (📦, ✅, ⚠️, ❌, 💾, ℹ️)
- Error handling doesn't fail the action for cache operations
- Post action runs even if main action fails (for cache saving)

## Development Notes
- TypeScript strict mode is enabled
- ESM modules are used throughout
- ncc bundles all dependencies into single files
- Uses Node.js built-in modules with `node:` prefix
- Formatting appears to use tabs (based on file indentation)

## Testing Locally
The action requires:
1. `shopware-cli` to be installed
2. A valid Shopware project structure
3. Composer to be available for cache detection

## Common Commands
```bash
npm install            # Install dependencies
npm run build         # Build for production
npm run typecheck     # Check TypeScript types
```

## Future Improvements Considered
- Additional caching strategies could be added
- More granular cache key generation options
- Support for other package managers (npm, yarn)