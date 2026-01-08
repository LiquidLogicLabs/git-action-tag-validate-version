import { BaseParser } from './base';
import { VersionInfo } from '../types';
/**
 * Parser for Calendar Versioning (Calver) format
 * Supports: 2024.01.15, 24.01.15, 2024.1.15, 2024.01.1
 */
export declare class CalverParser extends BaseParser {
    private readonly calverPattern;
    canParse(tag: string): boolean;
    parse(tag: string): import("../types").ParserResult;
    protected reconstructVersion(info: VersionInfo, _originalTag: string): string;
}
//# sourceMappingURL=calver.d.ts.map