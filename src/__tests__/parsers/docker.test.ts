import { DockerParser } from '../../parsers/docker';

describe('DockerParser', () => {
  const parser = new DockerParser();

  describe('canParse', () => {
    it('should parse special Docker tags', () => {
      expect(parser.canParse('latest')).toBe(true);
      expect(parser.canParse('stable')).toBe(true);
      expect(parser.canParse('dev')).toBe(true);
      expect(parser.canParse('test')).toBe(true);
      expect(parser.canParse('prod')).toBe(true);
      expect(parser.canParse('production')).toBe(true);
      expect(parser.canParse('staging')).toBe(true);
    });

    it('should parse version-like Docker tags', () => {
      expect(parser.canParse('1.2.3')).toBe(true);
      expect(parser.canParse('v1.2.3')).toBe(true);
      expect(parser.canParse('1.2.3-alpine')).toBe(true);
      expect(parser.canParse('v1.2.3-ubuntu')).toBe(true);
      expect(parser.canParse('1.2.3-alpine-3.18')).toBe(true);
    });

    it('should parse opaque Docker tags', () => {
      expect(parser.canParse('noble-93a29495-ls57')).toBe(true);
      expect(parser.canParse('noble')).toBe(true);
      expect(parser.canParse('NOBLE-93A29495-LS57')).toBe(true);
      expect(parser.canParse('sha_abc1234-build.1')).toBe(true);
    });

    it('should not parse invalid tags', () => {
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse('-')).toBe(false);
      expect(parser.canParse('has/slash')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse special tags without numeric components', () => {
      const result = parser.parse('latest');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('latest'); // Special tags remain unchanged
      expect(result.info.major).toBe('');
      expect(result.info.minor).toBe('');
      expect(result.info.patch).toBe('');
      expect(result.info.prerelease).toBe('');
      expect(result.info.build).toBe('');
    });

    it('should parse version tags', () => {
      const result = parser.parse('1.2.3');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('1.2.3'); // Reconstructed from components
      expect(result.info.major).toBe('1');
      expect(result.info.minor).toBe('2');
      expect(result.info.patch).toBe('3');
    });

    it('should parse version tags with v prefix', () => {
      const result = parser.parse('v1.2.3');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('1.2.3'); // Reconstructed without 'v' prefix
      expect(result.info.major).toBe('1');
      expect(result.info.minor).toBe('2');
      expect(result.info.patch).toBe('3');
    });

    it('should parse tags with suffix', () => {
      const result = parser.parse('1.2.3-alpine');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('1.2.3-alpine'); // Reconstructed with suffix
      expect(result.info.major).toBe('1');
      expect(result.info.minor).toBe('2');
      expect(result.info.patch).toBe('3');
      expect(result.info.prerelease).toBe('alpine');
    });

    it('should parse tags with multiple suffixes', () => {
      const result = parser.parse('1.2.3-alpine-3.18');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('1.2.3-alpine-3.18'); // Reconstructed with suffix
      expect(result.info.major).toBe('1');
      expect(result.info.minor).toBe('2');
      expect(result.info.patch).toBe('3');
      expect(result.info.prerelease).toBe('alpine-3.18');
    });

    it('should handle case-insensitive special tags', () => {
      const result1 = parser.parse('LATEST');
      expect(result1.isValid).toBe(true);
      expect(result1.version).toBe('LATEST'); // Special tags remain unchanged (case preserved)
      expect(result1.info.major).toBe('');

      const result2 = parser.parse('Stable');
      expect(result2.isValid).toBe(true);
      expect(result2.version).toBe('Stable'); // Special tags remain unchanged
      expect(result2.info.major).toBe('');
    });

    it('should fail on invalid tags', () => {
      const result = parser.parse('invalid-tag-format');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('invalid'); // root before first '-'
      expect(result.info.major).toBe('');
      expect(result.info.minor).toBe('');
      expect(result.info.patch).toBe('');
      expect(result.info.prerelease).toBe('tag-format');
    });

    it('should parse opaque tags and split on first dash', () => {
      const result = parser.parse('noble-93a29495-ls57');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('noble');
      expect(result.info.major).toBe('');
      expect(result.info.minor).toBe('');
      expect(result.info.patch).toBe('');
      expect(result.info.prerelease).toBe('93a29495-ls57');
      expect(result.info.build).toBe('');
    });

    it('should parse opaque tags without dash', () => {
      const result = parser.parse('noble');
      expect(result.isValid).toBe(true);
      expect(result.version).toBe('noble');
      expect(result.info.prerelease).toBe('');
    });

    it('should fail on docker-invalid characters', () => {
      const result = parser.parse('has/slash');
      expect(result.isValid).toBe(false);
      expect(result.version).toBe('has/slash');
    });
  });

  describe('Version Reconstruction', () => {
    it('should keep special tags unchanged', () => {
      const result = parser.parse('latest');
      expect(result.version).toBe('latest');
    });

    it('should reconstruct version without v prefix', () => {
      const result = parser.parse('v1.2.3-alpine');
      expect(result.version).toBe('1.2.3-alpine');
    });

    it('should reconstruct version with missing patch', () => {
      const result = parser.parse('v1.2-alpine');
      expect(result.version).toBe('1.2.0-alpine'); // Normalize to 3 parts
    });
  });
});

