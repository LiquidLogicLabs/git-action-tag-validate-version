import { ParserRegistry } from '../../parsers';
import { VersionType } from '../../types';

describe('ParserRegistry', () => {
  const registry = new ParserRegistry();

  describe('getParser', () => {
    it('should return parser for valid version types', () => {
      expect(registry.getParser(VersionType.SEMVER)).not.toBeNull();
      expect(registry.getParser(VersionType.SIMPLE)).not.toBeNull();
      expect(registry.getParser(VersionType.DOCKER)).not.toBeNull();
      expect(registry.getParser(VersionType.CALVER)).not.toBeNull();
      expect(registry.getParser(VersionType.DATE_BASED)).not.toBeNull();
    });

    it('should return null for AUTO type', () => {
      expect(registry.getParser(VersionType.AUTO)).toBeNull();
    });
  });

  describe('autoDetectParser', () => {
    it('should detect semver format', () => {
      const parser = registry.autoDetectParser('v1.2.3');
      expect(parser).not.toBeNull();
      expect(parser?.canParse('v1.2.3')).toBe(true);
    });

    it('should detect calver format', () => {
      const parser = registry.autoDetectParser('2024.01.15');
      expect(parser).not.toBeNull();
      expect(parser?.canParse('2024.01.15')).toBe(true);
    });

    it('should detect date-based format', () => {
      const parser = registry.autoDetectParser('20240115');
      expect(parser).not.toBeNull();
      expect(parser?.canParse('20240115')).toBe(true);
    });

    it('should detect simple format', () => {
      const parser = registry.autoDetectParser('1.2.3');
      expect(parser).not.toBeNull();
      expect(parser?.canParse('1.2.3')).toBe(true);
    });

    it('should detect docker format', () => {
      const parser = registry.autoDetectParser('latest');
      expect(parser).not.toBeNull();
      expect(parser?.canParse('latest')).toBe(true);
    });

    it('should detect docker format for opaque docker tags', () => {
      const parser = registry.autoDetectParser('noble-93a29495-ls57');
      expect(parser).not.toBeNull();
      expect(parser?.canParse('noble-93a29495-ls57')).toBe(true);
    });

    it('should return null for unrecognized format', () => {
      const parser = registry.autoDetectParser('invalid/format/xyz');
      expect(parser).toBeNull();
    });
  });

  describe('parse', () => {
    it('should parse with explicit version type', () => {
      const result = registry.parse('v1.2.3', VersionType.SEMVER);
      expect(result.isValid).toBe(true);
      expect(result.info.major).toBe('1');
    });

    it('should auto-detect when version type is AUTO', () => {
      const result = registry.parse('v1.2.3', VersionType.AUTO);
      expect(result.isValid).toBe(true);
      expect(result.info.major).toBe('1');
    });

    it('should fall back to auto when invalid version type provided', () => {
      // @ts-expect-error - testing invalid version type
      const result = registry.parse('v1.2.3', 'invalid');
      expect(result.isValid).toBe(true);
      expect(result.info.major).toBe('1');
    });

    it('should return invalid result when no parser can handle tag', () => {
      const result = registry.parse('completely/invalid/tag/xyz', VersionType.AUTO);
      expect(result.isValid).toBe(false);
      expect(result.version).toBe('completely/invalid/tag/xyz');
    });

    it('should handle different version types correctly', () => {
      const semverResult = registry.parse('v1.2.3', VersionType.SEMVER);
      expect(semverResult.isValid).toBe(true);

      const simpleResult = registry.parse('1.2.3', VersionType.SIMPLE);
      expect(simpleResult.isValid).toBe(true);

      const dockerResult = registry.parse('latest', VersionType.DOCKER);
      expect(dockerResult.isValid).toBe(true);

      const calverResult = registry.parse('2024.01.15', VersionType.CALVER);
      expect(calverResult.isValid).toBe(true);

      const dateResult = registry.parse('20240115', VersionType.DATE_BASED);
      expect(dateResult.isValid).toBe(true);
    });

    it('should auto-detect and parse opaque docker tags', () => {
      const result = registry.parse('noble-93a29495-ls57', VersionType.AUTO);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe(VersionType.DOCKER);
      expect(result.version).toBe('noble');
      expect(result.info.prerelease).toBe('93a29495-ls57');
      expect(result.info.major).toBe('');
    });
  });
});

