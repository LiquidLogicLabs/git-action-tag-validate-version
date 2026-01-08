import { BaseParser } from './base';
import { VersionInfo } from '../types';
/**
 * Parser for simple versioning format
 * Supports: 1.2, 1.2.3, 1.2.3.4, v1.2, v1.2.3
 */
export declare class SimpleParser extends BaseParser {
    private readonly simplePattern;
    canParse(tag: string): boolean;
    parse(tag: string): import("../types").ParserResult;
    protected reconstructVersion(info: VersionInfo, _originalTag: string): string;
}
//# sourceMappingURL=simple.d.ts.map