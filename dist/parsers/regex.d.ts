import { ParserResult, VersionInfo } from '../types';
import { BaseParser } from './base';
/**
 * Parser that validates and extracts version components using a user-supplied regex.
 * Named capture groups map to version outputs:
 *   (?<major>...), (?<minor>...), (?<patch>...), (?<prerelease>...), (?<build>...)
 * The `version` output is reconstructed from captured components (major.minor.patch[-prerelease][+build]).
 * If no named groups are captured the version falls back to the tag with any leading `v` stripped.
 */
export declare class RegexParser extends BaseParser {
    private readonly pattern;
    constructor(pattern: string);
    canParse(tag: string): boolean;
    parse(tag: string): ParserResult;
    protected reconstructVersion(info: VersionInfo, originalTag: string): string;
}
//# sourceMappingURL=regex.d.ts.map