import { ParserResult, VersionInfo } from '../types';
import { BaseParser } from './base';
/**
 * Parser that validates and extracts version components using a user-supplied regex.
 *
 * Named capture groups (preferred):
 *   (?<major>...), (?<minor>...), (?<patch>...), (?<prerelease>...), (?<build>...)
 *
 * Positional capture groups (fallback when no named group is present for a field):
 *   Group 1 → major, Group 2 → minor, Group 3 → patch, Group 4 → prerelease, Group 5 → build
 *
 * Named groups take priority over positional groups on a per-field basis.
 * The `version` output is reconstructed from captured components (major.minor.patch[-prerelease][+build]).
 * If no components are captured the version falls back to the tag with any leading `v` stripped.
 */
export declare class RegexParser extends BaseParser {
    private readonly pattern;
    constructor(pattern: string);
    canParse(tag: string): boolean;
    parse(tag: string): ParserResult;
    protected reconstructVersion(info: VersionInfo, originalTag: string): string;
}
//# sourceMappingURL=regex.d.ts.map