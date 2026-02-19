import { RegexParser } from '../../parsers/regex';
import { VersionType } from '../../types';

describe('RegexParser', () => {
  describe('constructor', () => {
    it('should compile a valid regex pattern', () => {
      expect(() => new RegexParser('^v?\\d+\\.\\d+\\.\\d+$')).not.toThrow();
    });

    it('should throw a SyntaxError for an invalid regex pattern', () => {
      expect(() => new RegexParser('[invalid')).toThrow(SyntaxError);
    });
  });

  describe('canParse', () => {
    it('should return true when the tag matches the pattern', () => {
      const parser = new RegexParser('^v?\\d+\\.\\d+\\.\\d+$');
      expect(parser.canParse('v1.2.3')).toBe(true);
      expect(parser.canParse('1.2.3')).toBe(true);
    });

    it('should return false when the tag does not match the pattern', () => {
      const parser = new RegexParser('^v?\\d+\\.\\d+\\.\\d+$');
      expect(parser.canParse('n8n@2.9.1')).toBe(false);
      expect(parser.canParse('abc')).toBe(false);
    });
  });

  describe('parse — named capture groups', () => {
    it('should extract major/minor/patch from named groups', () => {
      const parser = new RegexParser('^v?(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)$');
      const result = parser.parse('v2.9.1');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('2.9.1');
      expect(result.info.major).toBe('2');
      expect(result.info.minor).toBe('9');
      expect(result.info.patch).toBe('1');
      expect(result.info.prerelease).toBe('');
      expect(result.info.build).toBe('');
      expect(result.format).toBe(VersionType.REGEX);
    });

    it('should extract prerelease and build from named groups', () => {
      const parser = new RegexParser(
        '^v?(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)(?:-(?<prerelease>[\\w.]+))?(?:\\+(?<build>[\\w.]+))?$',
      );
      const result = parser.parse('1.0.0-alpha.1+build.42');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('1.0.0-alpha.1+build.42');
      expect(result.info.prerelease).toBe('alpha.1');
      expect(result.info.build).toBe('build.42');
    });

    it('should handle package-prefixed tags (e.g. n8n@2.9.1)', () => {
      const parser = new RegexParser(
        '^[a-zA-Z0-9_-]+@v?(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)$',
      );
      const result = parser.parse('n8n@2.9.1');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('2.9.1');
      expect(result.info.major).toBe('2');
      expect(result.info.minor).toBe('9');
      expect(result.info.patch).toBe('1');
    });
  });

  describe('parse — no named groups', () => {
    it('should be valid with empty components when no named groups are used', () => {
      const parser = new RegexParser('^release-\\d{8}$');
      const result = parser.parse('release-20240115');
      expect(result.isValid).toBe(true);
      expect(result.info.major).toBe('');
      expect(result.info.minor).toBe('');
      expect(result.info.patch).toBe('');
      // Falls back to stripped tag when no components captured
      expect(result.version).toBe('release-20240115');
    });
  });

  describe('parse — no match', () => {
    it('should return isValid false when the pattern does not match', () => {
      const parser = new RegexParser('^v?(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)$');
      const result = parser.parse('not-a-version');
      expect(result.isValid).toBe(false);
      expect(result.version).toBe('not-a-version');
      expect(result.info.major).toBe('');
    });
  });
});
