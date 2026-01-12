import { BaseParser } from './base';
import { VersionInfo } from '../types';

/**
 * Parser for Docker tag formats
 * Supports: latest, stable, 1.2.3, v1.2.3, 1.2.3-alpine, v1.2.3-ubuntu, 1.2.3-alpine-3.18
 */
export class DockerParser extends BaseParser {
  // Special tags that don't have numeric components
  private readonly specialTags = ['latest', 'stable', 'dev', 'test', 'prod', 'production', 'staging'];

  // Docker tag pattern: optional 'v' prefix, version numbers, optional suffixes with hyphens
  private readonly dockerVersionPattern = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([\w.-]+))?$/i;

  // Docker tag character constraints (not a version schema):
  // - 1 to 128 chars
  // - first char: [A-Za-z0-9_]
  // - remaining: [A-Za-z0-9_.-]
  // Matches Docker's documented tag grammar: /[\w][\w.-]{0,127}/
  private readonly dockerTagPattern = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;

  canParse(tag: string): boolean {
    // Accept special tags, version-like tags, or any valid docker tag (opaque tags)
    const lowerTag = tag.toLowerCase();
    return this.specialTags.includes(lowerTag) || this.dockerVersionPattern.test(tag) || this.dockerTagPattern.test(tag);
  }

  parse(tag: string) {
    const lowerTag = tag.toLowerCase();

    // Handle special tags
    if (this.specialTags.includes(lowerTag)) {
      return this.createSuccessResult(tag, {
        major: '',
        minor: '',
        patch: '',
        prerelease: '',
        build: '',
      });
    }

    // Try to parse as version
    const match = tag.match(this.dockerVersionPattern);
    if (!match) {
      // If it's a valid docker tag but not version-like, treat it as an opaque tag.
      // For opaque tags, return the root segment (before first '-') as `version`,
      // and store the remainder (if any) in `prerelease`.
      if (!this.dockerTagPattern.test(tag)) {
        return this.createFailedResult(tag);
      }

      const dashIndex = tag.indexOf('-');
      const remainder = dashIndex === -1 ? '' : tag.slice(dashIndex + 1);

      return this.createSuccessResult(tag, {
        major: '',
        minor: '',
        patch: '',
        prerelease: remainder,
        build: '',
      });
    }

    const [, major, minor = '', patch = '', suffix = ''] = match;

    return this.createSuccessResult(tag, {
      major,
      minor,
      patch,
      prerelease: suffix,
      build: '',
    });
  }

  protected reconstructVersion(info: VersionInfo, originalTag: string): string {
    // Special tags (latest, stable, etc.) - keep original tag
    const lowerTag = originalTag.toLowerCase();
    if (this.specialTags.includes(lowerTag)) {
      return originalTag;
    }

    // Opaque docker tags: root is everything before the first '-'
    if (!info.major) {
      const dashIndex = originalTag.indexOf('-');
      return dashIndex === -1 ? originalTag : originalTag.slice(0, dashIndex);
    }

    // Version-like tags: normalize to 3 parts if patch missing, add suffix
    const patch = info.patch || '0';
    let version = `${info.major}.${info.minor}.${patch}`;
    
    // Add suffix (stored in prerelease field) if present
    if (info.prerelease) {
      version += `-${info.prerelease}`;
    }

    return version;
  }
}

