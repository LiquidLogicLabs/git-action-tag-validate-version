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
    format?: VersionType;
}
/**
 * Supported version format types
 */
export declare enum VersionType {
    AUTO = "auto",
    SEMVER = "semver",
    SIMPLE = "simple",
    DOCKER = "docker",
    CALVER = "calver",
    DATE_BASED = "date-based",
    REGEX = "regex"
}
