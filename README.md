# Build Project Action

GitHub Action to build a Shopware project using `shopware-cli`. It runs the Shopware CI build for a given path and optionally uses a GitHub token for repository-authenticated operations.

## Requirements
- `shopware-cli` available on the runner. Recommended: install via the official setup action:
  - `- uses: shopware/shopware-cli-action@v1`

## Inputs
- `path`: Path to the project to build. Default: `.`
- `github-token`: Optional token used by `shopware-cli` for Git context. Default: `${{ github.token }}`

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

## How it works

Under the hood this action runs:
```
shopware-cli project ci <path>
```

The difference to just running the command is that the action enables the access to the GitHub Actions Cache API and therefore can cache the build artifacts.

## License
This project is released under the MIT License. See `LICENSE.md`.
