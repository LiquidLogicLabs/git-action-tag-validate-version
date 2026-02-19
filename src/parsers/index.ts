import { VersionType } from '../types';
import { VersionParser } from './base';
import { SemverParser } from './semver';
import { SimpleParser } from './simple';
import { DockerParser } from './docker';
import { CalverParser } from './calver';
import { DateBasedParser } from './date-based';
import { RegexParser } from './regex';

/**
 * Parser registry and routing logic
 */
export class ParserRegistry {
  private readonly parsers: Map<VersionType, VersionParser> = new Map();

  constructor(regexPattern?: string) {
    // Initialize parsers
    this.parsers.set(VersionType.SEMVER, new SemverParser());
    this.parsers.set(VersionType.SIMPLE, new SimpleParser());
    this.parsers.set(VersionType.DOCKER, new DockerParser());
    this.parsers.set(VersionType.CALVER, new CalverParser());
    this.parsers.set(VersionType.DATE_BASED, new DateBasedParser());
    if (regexPattern) {
      this.parsers.set(VersionType.REGEX, new RegexParser(regexPattern));
    }
  }

  /**
   * Get parser for a specific version type
   */
  getParser(versionType: VersionType): VersionParser | null {
    if (versionType === VersionType.AUTO) {
      return null; // Auto-detection handled separately
    }
    return this.parsers.get(versionType) || null;
  }

  /**
   * Auto-detect parser by trying each parser's canParse method
   * Returns the first parser that can handle the tag
   */
  autoDetectParser(tag: string): VersionParser | null {
    // Try parsers in order of specificity (most specific first)
    const parserOrder: VersionType[] = [
      VersionType.SEMVER,
      VersionType.CALVER,
      VersionType.DATE_BASED,
      VersionType.SIMPLE,
      VersionType.DOCKER,
    ];

    for (const type of parserOrder) {
      const parser = this.parsers.get(type);
      if (parser && parser.canParse(tag)) {
        return parser;
      }
    }

    return null;
  }

  /**
   * Parse a tag with the specified version type (or auto-detect)
   */
  parse(tag: string, versionType: VersionType) {
    let parser: VersionParser | null;
    let detectedFormat: VersionType | undefined;

    if (versionType === VersionType.AUTO) {
      parser = this.autoDetectParser(tag);
      if (!parser) {
        // No parser could handle it
        return {
          isValid: false,
          version: tag,
          info: {
            major: '',
            minor: '',
            patch: '',
            prerelease: '',
            build: '',
          },
          format: undefined,
        };
      }
      // Find which format was detected
      for (const [type, p] of this.parsers.entries()) {
        if (p === parser) {
          detectedFormat = type;
          break;
        }
      }
    } else {
      parser = this.getParser(versionType);
      if (!parser) {
        // Invalid versionType, fall back to auto
        parser = this.autoDetectParser(tag);
        if (!parser) {
          return {
            isValid: false,
            version: tag,
            info: {
              major: '',
              minor: '',
              patch: '',
              prerelease: '',
              build: '',
            },
            format: undefined,
          };
        }
        // Find which format was detected
        for (const [type, p] of this.parsers.entries()) {
          if (p === parser) {
            detectedFormat = type;
            break;
          }
        }
      } else {
        detectedFormat = versionType;
      }
    }

    const result = parser.parse(tag);
    return {
      ...result,
      format: detectedFormat,
    };
  }
}

