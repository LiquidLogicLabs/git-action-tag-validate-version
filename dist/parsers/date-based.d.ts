import { BaseParser } from './base';
import { VersionInfo } from '../types';
/**
 * Parser for date-based version formats
 * Supports: 20240115 (YYYYMMDD), 2024-01-15 (YYYY-MM-DD), 2024/01/15 (YYYY/MM/DD)
 */
export declare class DateBasedParser extends BaseParser {
    private readonly yyyymmddPattern;
    private readonly yyyyMmDdPattern;
    canParse(tag: string): boolean;
    private isValidDate;
    parse(tag: string): import("../types").ParserResult;
    protected reconstructVersion(info: VersionInfo, _originalTag: string): string;
}
//# sourceMappingURL=date-based.d.ts.map