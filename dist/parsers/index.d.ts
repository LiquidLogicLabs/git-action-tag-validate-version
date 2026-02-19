import { VersionType } from '../types';
import { VersionParser } from './base';
/**
 * Parser registry and routing logic
 */
export declare class ParserRegistry {
    private readonly parsers;
    constructor(regexPattern?: string);
    /**
     * Get parser for a specific version type
     */
    getParser(versionType: VersionType): VersionParser | null;
    /**
     * Auto-detect parser by trying each parser's canParse method
     * Returns the first parser that can handle the tag
     */
    autoDetectParser(tag: string): VersionParser | null;
    /**
     * Parse a tag with the specified version type (or auto-detect)
     */
    parse(tag: string, versionType: VersionType): {
        format: VersionType | undefined;
        isValid: boolean;
        version: string;
        info: import("../types").VersionInfo;
    };
}
//# sourceMappingURL=index.d.ts.map