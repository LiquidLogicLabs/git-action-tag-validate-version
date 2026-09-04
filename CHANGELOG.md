## [2.1.7](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.6...v2.1.7) (2026-09-04)



## [2.1.6](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.5...v2.1.6) (2026-09-04)


### Bug Fixes

* resolve tags only in tagExists, closing a wrong output and an option slot ([78efc28](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/78efc289309ed1cfe3fbae81e0126467d4d8d3da))



## [2.1.5](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.4...v2.1.5) (2026-09-03)


### Bug Fixes

* **lint:** quote eslint glob so all of src/ is linted ([465ad90](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/465ad903e6803e375399886a105f88cbb4383cfb))
* **lint:** resolve errors surfaced by the widened glob ([d149eb8](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/d149eb888e839a39c3f419c9460d7dee7e81196a))



## [2.1.4](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.3...v2.1.4) (2026-07-05)



## [2.1.3](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.2...v2.1.3) (2026-04-21)



## [2.1.2](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.1...v2.1.2) (2026-02-20)


### Features

* parse tag string when provided regardless of local existence ([f37ca11](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/f37ca111a991e72d199ba3a08e4eadab8ce4efa1))



## [2.1.1](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.1.0...v2.1.1) (2026-02-19)


### Features

* **regex:** add positional capture group support ([4072815](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/40728154cdb3a085cfac513a38393abba082a03f))
* **regex:** add positional capture group support and update docs ([8dde88e](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/8dde88effa39d784d8957506b9f554601cb0048a))



# [2.1.0](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/compare/v2.0.1...v2.1.0) (2026-02-19)


### Features

* add regex version-type with custom pattern support ([ccbbb5c](https://github.com/LiquidLogicLabs/git-action-tag-validate-version/commit/ccbbb5c33962e8dc92b620083a7eaddf9f9531d6))



# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5] - 2025-01-25

### Changed
- Updated dependencies to latest versions
- Migrated to ESLint 9.x with flat config

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Validate and parse git tags into structured version information
- Support for semantic versioning and calendar versioning
