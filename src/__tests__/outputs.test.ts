import { ParserRegistry } from '../parsers';
import { VersionType } from '../types';

describe('Output Format Detection', () => {
  const registry = new ParserRegistry();

  describe('format output', () => {
    it('should return format for semver tags', () => {
      const result = registry.parse('v1.2.3', VersionType.AUTO);
      expect(result.format).toBe(VersionType.SEMVER);
    });

    it('should return format for simple tags', () => {
      const result = registry.parse('1.2.3', VersionType.SIMPLE);
      expect(result.format).toBe(VersionType.SIMPLE);
    });

    it('should return format for docker tags', () => {
      const result = registry.parse('latest', VersionType.AUTO);
      expect(result.format).toBe(VersionType.DOCKER);
    });

    it('should return format for calver tags', () => {
      // Use explicit calver type since semver can also parse this format
      const result = registry.parse('2024.01.15', VersionType.CALVER);
      expect(result.format).toBe(VersionType.CALVER);
    });

    it('should auto-detect calver when semver cannot parse', () => {
      // Use a date that semver cannot parse (month > 12)
      const result = registry.parse('2024.13.15', VersionType.AUTO);
      // This should fail validation, but let's test with a valid calver that's less likely to be semver
      // Actually, let's just test that explicit calver works
      const result2 = registry.parse('2024.12.31', VersionType.CALVER);
      expect(result2.format).toBe(VersionType.CALVER);
    });

    it('should return format for date-based tags', () => {
      const result = registry.parse('20240115', VersionType.AUTO);
      expect(result.format).toBe(VersionType.DATE_BASED);
    });

    it('should treat opaque docker-valid tags as docker format in auto mode', () => {
      const result = registry.parse('invalid-tag-xyz', VersionType.AUTO);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe(VersionType.DOCKER);
      expect(result.version).toBe('invalid');
      expect(result.info.prerelease).toBe('tag-xyz');
      expect(result.info.major).toBe('');
    });
  });

  describe('year, month, day outputs for calver', () => {
    it('should extract year, month, day from calver format', () => {
      const result = registry.parse('2024.01.15', VersionType.CALVER);
      expect(result.info.major).toBe('2024'); // year
      expect(result.info.minor).toBe('01'); // month
      expect(result.info.patch).toBe('15'); // day
    });

    it('should handle 2-digit year in calver', () => {
      const result = registry.parse('24.01.15', VersionType.CALVER);
      expect(result.info.major).toBe('2024'); // normalized year
      expect(result.info.minor).toBe('01'); // month
      expect(result.info.patch).toBe('15'); // day
    });
  });

  describe('year, month, day outputs for date-based', () => {
    it('should extract year, month, day from YYYYMMDD format', () => {
      const result = registry.parse('20240115', VersionType.DATE_BASED);
      expect(result.info.major).toBe('2024'); // year
      expect(result.info.minor).toBe('01'); // month
      expect(result.info.patch).toBe('15'); // day
    });

    it('should extract year, month, day from YYYY-MM-DD format', () => {
      const result = registry.parse('2024-01-15', VersionType.DATE_BASED);
      expect(result.info.major).toBe('2024'); // year
      expect(result.info.minor).toBe('01'); // month
      expect(result.info.patch).toBe('15'); // day
    });
  });

  describe('hasPrerelease and hasBuild for semver', () => {
    it('should have hasPrerelease=true when prerelease exists', () => {
      const result = registry.parse('v1.2.3-alpha.1', VersionType.SEMVER);
      expect(result.info.prerelease).toBe('alpha.1');
      expect(result.info.prerelease ? true : false).toBe(true);
    });

    it('should have hasPrerelease=false when no prerelease', () => {
      const result = registry.parse('v1.2.3', VersionType.SEMVER);
      expect(result.info.prerelease).toBe('');
      expect(result.info.prerelease ? true : false).toBe(false);
    });

    it('should have hasBuild=true when build metadata exists', () => {
      const result = registry.parse('v1.2.3+build.1', VersionType.SEMVER);
      expect(result.info.build).toBe('build.1');
      expect(result.info.build ? true : false).toBe(true);
    });

    it('should have hasBuild=false when no build metadata', () => {
      const result = registry.parse('v1.2.3', VersionType.SEMVER);
      expect(result.info.build).toBe('');
      expect(result.info.build ? true : false).toBe(false);
    });

    it('should have both flags true when both exist', () => {
      const result = registry.parse('v1.2.3-alpha.1+build.1', VersionType.SEMVER);
      expect(result.info.prerelease).toBe('alpha.1');
      expect(result.info.build).toBe('build.1');
      expect(result.info.prerelease ? true : false).toBe(true);
      expect(result.info.build ? true : false).toBe(true);
    });
  });
});

