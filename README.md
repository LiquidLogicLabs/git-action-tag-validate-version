# Git Tag Validate Version Action

[![CI](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/actions/workflows/ci.yml/badge.svg)](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)

A GitHub Action that validates and parses git tags into structured version information. Supports multiple version formats including semver, simple versioning, Docker tags, calendar versioning, date-based formats, and custom regex patterns.

## Features

- **Multiple Format Support**: Automatically detects and parses semver, simple, Docker, calver, and date-based version formats
- **Custom Regex Support**: Supply your own regex pattern to validate and extract version components from any tag scheme
- **Auto-Detection**: Automatically determines the version format type, or specify it explicitly
- **Comprehensive Outputs**: Extracts major, minor, patch, prerelease, build metadata, and commit SHA
- **Flexible Tag Input**: Use a specific tag or automatically use the most recent tag
- **Verbose Logging**: Optional debug output via `verbose` input flag or `ACTIONS_STEP_DEBUG` environment variable
- **Extensible Architecture**: Easy to add new version format parsers

## Usage

### Basic Usage (Auto-detect format)

```yaml
- name: Parse version from most recent tag
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  id: version
```

### Specify a Tag

```yaml
- name: Parse specific tag
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: 'v1.2.3'
  id: version
```

### Specify Version Type

```yaml
- name: Parse as semver
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: 'v1.2.3-alpha.1'
    version-type: 'semver'
  id: version
```

### Enable Verbose Logging

Verbose logging can be enabled in two ways:

**Option 1: Using the `verbose` input flag (recommended for convenience)**

```yaml
- name: Parse version with debug logging
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: 'v1.2.3'
    verbose: 'true'
  id: version
```

**Option 2: Using GitHub Actions' standard `ACTIONS_STEP_DEBUG` environment variable**

Enable it at the workflow level:

```yaml
name: Parse Version

on: [push]

env:
  ACTIONS_STEP_DEBUG: true

jobs:
  parse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Parse version with debug logging
        uses: LiquidLogicLabs/git-action-tag-validate-version@v1
        with:
          tag: 'v1.2.3'
        id: version
```

Or enable it for a specific step:

```yaml
- name: Parse version with debug logging
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  env:
    ACTIONS_STEP_DEBUG: true
  with:
    tag: 'v1.2.3'
  id: version
```

Both methods enable the same debug output. The `verbose` input flag is a convenience option that automatically sets `ACTIONS_STEP_DEBUG` for you.

### Use Outputs

```yaml
- name: Parse version
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  id: version

- name: Use parsed version
  run: |
    echo "Version: ${{ steps.version.outputs.version }}"
    echo "Major: ${{ steps.version.outputs.major }}"
    echo "Minor: ${{ steps.version.outputs.minor }}"
    echo "Patch: ${{ steps.version.outputs.patch }}"
    if [ "${{ steps.version.outputs.is-valid }}" == "true" ]; then
      echo "Version is valid!"
    fi
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `tag` | Specific tag to parse. If empty, uses most recent tag | No | `''` |
| `version-type` | Version format type (`auto`, `semver`, `simple`, `docker`, `calver`, `date-based`, `regex`) | No | `auto` |
| `version-regex` | Custom regex pattern used when `version-type` is `regex`. Named groups (`?<major>`, `?<minor>`, `?<patch>`, `?<prerelease>`, `?<build>`) or positional groups (1=major, 2=minor, 3=patch, 4=prerelease, 5=build) are mapped to outputs. Named groups take priority. | No | `''` |
| `verbose` | Force enable debug logging (sets `ACTIONS_STEP_DEBUG=true`). Can also be enabled via `ACTIONS_STEP_DEBUG` environment variable | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `is-valid` | Boolean indicating if version was successfully validated and parsed |
| `version` | Normalized version string reconstructed from parsed components (format-compliant, no 'v' prefix, standardized separators). Returns original tag if parsing failed |
| `format` | Detected version format type (semver, simple, docker, calver, date-based, regex, or empty if invalid) |
| `major` | Major version number (if available) |
| `minor` | Minor version number (if available) |
| `patch` | Patch version number (if available) |
| `prerelease` | Prerelease identifier (if available) |
| `build` | Build metadata (if available) |
| `commit` | Short commit SHA extracted from tag (if found in + or - format) |
| `year` | Year component (for calver and date-based formats only) |
| `month` | Month component (for calver and date-based formats only) |
| `day` | Day component (for calver and date-based formats only) |
| `has-prerelease` | Boolean indicating if semver version has prerelease identifier |
| `has-build` | Boolean indicating if semver version has build metadata |

## Permissions

No special permissions are required. Typical workflows need `contents: read` for checkout.

## Supported Version Formats

### Semver

- `v1.2.3` (3-part version)
- `1.2.3` (3-part version)
- `v1.2` (2-part version, patch optional)
- `1.2` (2-part version, patch optional)
- `v1.2.3-alpha.1`
- `1.2.3-beta.2`
- `v1.2-alpha.1` (2-part with prerelease)
- `1.2-beta.2` (2-part with prerelease)
- `v1.2.3+build.1`
- `1.2.3+20240115`
- `v1.2.3-alpha.1+build.1`

### Simple Versioning

- `1.2.3.4` (4-part version)
- `1.2.3` (3-part version, but will be detected as semver in auto mode)
- `1.2` (2-part version, but will be detected as semver in auto mode)
- `v1.2.3` (3-part version, but will be detected as semver in auto mode)
- `v1.2` (2-part version, but will be detected as semver in auto mode)

**Note**: In auto-detection mode, 2-part and 3-part versions are detected as semver. Use `version-type: 'simple'` to force simple version parsing.

### Docker Tags

- `latest`
- `stable`
- `1.2.3`
- `v1.2.3`
- `1.2.3-alpine`
- `v1.2.3-ubuntu`
- `1.2.3-alpine-3.18`
- `noble-93a29495-ls57`

### Calendar Versioning (Calver)

- `2024.01.15`
- `24.01.15`
- `2024.1.15`
- `2024.01.1`

### Date-Based

- `20240115` (YYYYMMDD)
- `2024-01-15` (YYYY-MM-DD)
- `2024/01/15` (YYYY/MM/DD)

### Regex (Custom Pattern)

Any tag format you define via a regular expression. Set `version-type: regex` and supply a pattern in `version-regex`.

**Named capture groups** (recommended — explicit field mapping):

```yaml
version-type: regex
version-regex: '^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[\w.]+))?$'
```

**Positional capture groups** (order: 1=major, 2=minor, 3=patch, 4=prerelease, 5=build):

```yaml
version-type: regex
version-regex: '^v?(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?(?:\+([\w.]+))?$'
```

Named groups take priority over positional groups on a per-field basis. Groups can be mixed freely.

**Validation-only** (no capture groups — just checks the tag matches):

```yaml
version-type: regex
version-regex: '^release-\d{8}$'
```

When no components are captured, `version` falls back to the original tag with any leading `v` stripped.

## Version Output Normalization

The `version` output is reconstructed from parsed components to ensure a consistent, format-compliant string:

- **Semver**: Normalized to 3 parts (missing patch becomes `.0`), no 'v' prefix
  - `v1.2.3` → `1.2.3`
  - `v1.2` → `1.2.0`
  - `v1.2-alpha.1` → `1.2.0-alpha.1`
- **Simple**: No 'v' prefix, only non-empty components included
  - `v1.2.3.4` → `1.2.3.4`
  - `v1.2` → `1.2`
- **Docker**: Special tags unchanged, numeric version tags normalized (no 'v', patch normalized if missing). Opaque docker tags are split into a root `version` and a `prerelease` remainder.
  - `latest` → `latest`
  - `v1.2.3-alpine` → `1.2.3-alpine`
  - `v1.2-alpine` → `1.2.0-alpine`
  - `noble-93a29495-ls57` → `version=noble`, `prerelease=93a29495-ls57` (numeric components empty; full tag can be reconstructed as `noble-93a29495-ls57`)
- **Calver**: Normalized to `YYYY.MM.DD` with 4-digit year and padded month/day
  - `24.01.15` → `2024.01.15`
  - `2024.1.15` → `2024.01.15`
- **Date-based**: Standardized to `YYYY-MM-DD` format
  - `20240115` → `2024-01-15`
  - `2024/01/15` → `2024-01-15`
- **Regex**: Reconstructed from captured components as `major.minor.patch[-prerelease][+build]`; falls back to the stripped original tag when no components are captured

## Commit SHA Extraction

The action can extract commit SHA from tags in two formats:

1. **Semver build metadata**: `v1.2.3+abc1234` → extracts `abc1234`
2. **Hyphen suffix**: `v1.2.3-abc1234` → extracts `abc1234`

The commit SHA is returned as a 7-character short SHA.

## Examples

### Complete Workflow Example

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  parse-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Parse version
        uses: LiquidLogicLabs/git-action-tag-validate-version@v1
        id: version

      - name: Create release
        run: |
          echo "Creating release for version ${{ steps.version.outputs.version }}"
          echo "Major: ${{ steps.version.outputs.major }}"
          echo "Minor: ${{ steps.version.outputs.minor }}"
          echo "Patch: ${{ steps.version.outputs.patch }}"
```

### Using with Docker

```yaml
- name: Parse Docker tag
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: '1.2.3-alpine'
    version-type: 'docker'
  id: version
```

### Using with Calendar Versioning

```yaml
- name: Parse calver tag
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: '2024.01.15'
    version-type: 'calver'
  id: version
```

### Using a Custom Regex Pattern

Named capture groups:

```yaml
- name: Parse custom tag format
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: 'n8n@2.9.1'
    version-type: 'regex'
    version-regex: '^[a-zA-Z0-9_-]+@v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$'
  id: version
# outputs: version=2.9.1, major=2, minor=9, patch=1, format=regex
```

Positional capture groups:

```yaml
- name: Validate and extract using positional groups
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: 'v3.14.1'
    version-type: 'regex'
    version-regex: '^v?(\d+)\.(\d+)\.(\d+)$'
  id: version
# outputs: version=3.14.1, major=3, minor=14, patch=1, format=regex
```

Validation-only (no extraction):

```yaml
- name: Validate tag format only
  uses: LiquidLogicLabs/git-action-tag-validate-version@v1
  with:
    tag: 'release-20240115'
    version-type: 'regex'
    version-regex: '^release-\d{8}$'
  id: version
# outputs: is-valid=true, version=release-20240115, all components empty
```

## Error Handling

- **Tag not found**: Sets `is-valid=false`, `version=""`, all other outputs empty
- **No tags exist**: Sets `is-valid=false`, `version=""`, all other outputs empty
- **Parse failure**: Sets `is-valid=false`, preserves original `version` string, sets numeric outputs to empty strings
- **Invalid version-type**: Falls back to `auto` detection
- **`version-type: regex` with no `version-regex`**: Fails the action with a clear error message
- **Invalid regex syntax in `version-regex`**: Fails the action with the regex `SyntaxError`

## Security

This action only reads git tags from the local repository. It does not:
- Make any network requests
- Access any external APIs
- Modify the repository
- Access any secrets or sensitive data

## Documentation

For developers and contributors:

- **[Development Guide](docs/DEVELOPMENT.md)** - Setup, development workflow, and contributing guidelines
- **[Testing Guide](docs/TESTING.md)** - Complete testing documentation

## License

MIT

## Credits

Developed by [LiquidLogicLabs](https://github.com/LiquidLogicLabs)

