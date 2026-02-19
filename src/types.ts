/**
 * Version information extracted from a tag
 */
export interface VersionInfo {
  major: string;
  minor: string;
  patch: string;
  prerelease: string;
  build: string;
}

/**
 * Result from a version parser
 */
export interface ParserResult {
  isValid: boolean;
  version: string;
  info: VersionInfo;
  format?: VersionType; // The detected/used format type
}

/**
 * Supported version format types
 */
export enum VersionType {
  AUTO = 'auto',
  SEMVER = 'semver',
  SIMPLE = 'simple',
  DOCKER = 'docker',
  CALVER = 'calver',
  DATE_BASED = 'date-based',
  REGEX = 'regex',
}

