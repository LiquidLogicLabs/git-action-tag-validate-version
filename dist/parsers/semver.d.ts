import { BaseParser } from './base';
/**
 * Parser for Semantic Versioning (Semver) format
 * Supports: v1.2, 1.2, v1.2.3, 1.2.3, v1.2-alpha.1, 1.2.3-beta.2, v1.2.3+build.1, 1.2.3+20240115, v1.2.3-alpha.1+build.1
 */
export declare class SemverParser extends BaseParser {
    private readonly semverPattern;
    canParse(tag: string): boolean;
    parse(tag: string): import("../types").ParserResult;
}
//# sourceMappingURL=semver.d.ts.map