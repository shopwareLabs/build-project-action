# Build Project Action

GitHub Action to build a Shopware project using `shopware-cli`. It runs the Shopware CI build for a given path and optionally uses a GitHub token for repository-authenticated operations. The action automatically caches Composer dependencies to speed up subsequent builds.

## Requirements
- `shopware-cli` available on the runner. Recommended: install via the official setup action:
  - `- uses: shopware/shopware-cli-action@v1`

## Inputs
- `path`: Path to the project to build. Default: `.`
- `github-token`: Optional token used by `shopware-cli` for Git context. Default: `${{ github.token }}`
- `additional-composer-cache-key`: Optional additional suffix for the Composer cache key. Useful for cache busting when dependencies change outside of composer.lock/composer.json (e.g., PHP version changes). Default: `""`

## Usage

```yaml
name: Build Shopware Project
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      # Ensure shopware-cli is installed
      - uses: shopware/shopware-cli-action@v1

      # Build the project
      - name: Build with shopware-cli
        uses: shopwarelabs/build-project-action@v1
```

### Example with cache key customization

```yaml
      - name: Build with shopware-cli
        uses: shopwarelabs/build-project-action@v1
        with:
          path: ./my-project
          additional-composer-cache-key: php-${{ matrix.php-version }}
```

## How it works

Under the hood this action runs:
```
shopware-cli project ci <path>
```

The difference to just running the command is that the action provides:
1. **Composer Dependency Caching**: Automatically caches Composer dependencies based on `composer.lock` (or `composer.json` if lock file doesn't exist) to speed up builds
2. **GitHub Actions Cache API Access**: Enables caching of build artifacts
3. **Smart Cache Keys**: Generates cache keys based on the platform and dependency file contents, with optional custom suffixes

### Composer Caching

The action automatically:
- Detects the Composer cache directory
- Creates a cache key based on your `composer.lock` file (preferred) or `composer.json`
- Restores cached dependencies before the build
- Saves dependencies to cache after successful builds

Cache keys follow the pattern: `composer-{platform}-{hash}[-{additional-key}]`

For example:
- `composer-linux-abc123def456`
- `composer-linux-abc123def456-php-8.2` (with additional-composer-cache-key)

## License
This project is released under the MIT License. See `LICENSE.md`.
