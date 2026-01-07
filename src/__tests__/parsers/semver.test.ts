import { SemverParser } from '../../parsers/semver';

describe('SemverParser', () => {
  const parser = new SemverParser();

  describe('canParse', () => {
    it('should parse valid semver tags', () => {
      expect(parser.canParse('v1.2.3')).toBe(true);
      expect(parser.canParse('1.2.3')).toBe(true);
      expect(parser.canParse('v1.2')).toBe(true);
      expect(parser.canParse('1.2')).toBe(true);
      expect(parser.canParse('v1.2.3-alpha.1')).toBe(true);
      expect(parser.canParse('1.2.3-beta.2')).toBe(true);
      expect(parser.canParse('v1.2-alpha.1')).toBe(true);
      expect(parser.canParse('1.2-beta.2')).toBe(true);
      expect(parser.canParse('v1.2.3+build.1')).toBe(true);
      expect(parser.canParse('1.2.3+20240115')).toBe(true);
      expect(parser.canParse('v1.2.3-alpha.1+build.1')).toBe(true);
    });

    it('should not parse invalid semver tags', () => {
      expect(parser.canParse('v1')).toBe(false);
      expect(parser.canParse('1')).toBe(false);
      expect(parser.canParse('abc')).toBe(false);
      expect(parser.canParse('v1.2.3-')).toBe(false);
    });

    it('should not parse calendar versioning tags (should be handled by CalverParser)', () => {
      expect(parser.canParse('2024.01.15')).toBe(false); // Full calver
      expect(parser.canParse('24.01.15')).toBe(false); // Short year calver
      expect(parser.canParse('2024.01')).toBe(false); // Year.month (2 parts, year >= 2000)
      expect(parser.canParse('24.01')).toBe(false); // Short year.month
    });
  });

  describe('parse', () => {
    it('should parse basic semver tags', () => {
      const result = parser.parse('v1.2.3');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('v1.2.3');
      expect(result.info.major).toBe('1');
      expect(result.info.minor).toBe('2');
      expect(result.info.patch).toBe('3');
      expect(result.info.prerelease).toBe('');
      expect(result.info.build).toBe('');
    });

    it('should parse semver tags without patch version', () => {
      const result = parser.parse('v1.2');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('v1.2');
      expect(result.info.major).toBe('1');
      expect(result.info.minor).toBe('2');
      expect(result.info.patch).toBe('');
      expect(result.info.prerelease).toBe('');
      expect(result.info.build).toBe('');
    });

    it('should parse semver tags without patch version with prerelease', () => {
      const result = parser.parse('3.23-d34fa4d2-ls4');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('3.23-d34fa4d2-ls4');
      expect(result.info.major).toBe('3');
      expect(result.info.minor).toBe('23');
      expect(result.info.patch).toBe('');
      expect(result.info.prerelease).toBe('d34fa4d2-ls4');
      expect(result.info.build).toBe('');
    });

    it('should parse semver with prerelease', () => {
      const result = parser.parse('v1.2.3-alpha.1');
      expect(result.isValid).toBe(true);
      expect(result.info.prerelease).toBe('alpha.1');
    });

    it('should parse semver with build metadata', () => {
      const result = parser.parse('v1.2.3+build.1');
      expect(result.isValid).toBe(true);
      expect(result.info.build).toBe('build.1');
    });

    it('should parse semver with both prerelease and build', () => {
      const result = parser.parse('v1.2.3-alpha.1+build.1');
      expect(result.isValid).toBe(true);
      expect(result.info.prerelease).toBe('alpha.1');
      expect(result.info.build).toBe('build.1');
    });

    it('should fail on invalid tags', () => {
      const result = parser.parse('invalid');
      expect(result.isValid).toBe(false);
      expect(result.version).toBe('invalid');
    });
  });
});

