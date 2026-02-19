import { ParserResult, VersionInfo, VersionType } from '../types';
import { BaseParser } from './base';

/**
 * Parser that validates and extracts version components using a user-supplied regex.
 * Named capture groups map to version outputs:
 *   (?<major>...), (?<minor>...), (?<patch>...), (?<prerelease>...), (?<build>...)
 * The `version` output is reconstructed from captured components (major.minor.patch[-prerelease][+build]).
 * If no named groups are captured the version falls back to the tag with any leading `v` stripped.
 */
export class RegexParser extends BaseParser {
  private readonly pattern: RegExp;

  constructor(pattern: string) {
    super();
    // Throws SyntaxError on invalid pattern — propagates to core.setFailed() in index.ts
    this.pattern = new RegExp(pattern);
  }

  canParse(tag: string): boolean {
    return this.pattern.test(tag);
  }

  parse(tag: string): ParserResult {
    const match = tag.match(this.pattern);
    if (!match) return this.createFailedResult(tag);

    const groups = match.groups ?? {};
    const info = {
      major: groups['major'] ?? '',
      minor: groups['minor'] ?? '',
      patch: groups['patch'] ?? '',
      prerelease: groups['prerelease'] ?? '',
      build: groups['build'] ?? '',
    };

    const result = this.createSuccessResult(tag, info);
    return { ...result, format: VersionType.REGEX };
  }

  protected reconstructVersion(info: VersionInfo, originalTag: string): string {
    const base = [info.major, info.minor, info.patch].filter(Boolean).join('.');
    if (!base) return originalTag.replace(/^v/, '');
    let version = base;
    if (info.prerelease) version += `-${info.prerelease}`;
    if (info.build) version += `+${info.build}`;
    return version;
  }
}
