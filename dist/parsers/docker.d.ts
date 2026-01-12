import { BaseParser } from './base';
import { VersionInfo } from '../types';
/**
 * Parser for Docker tag formats
 * Supports: latest, stable, 1.2.3, v1.2.3, 1.2.3-alpine, v1.2.3-ubuntu, 1.2.3-alpine-3.18
 */
export declare class DockerParser extends BaseParser {
    private readonly specialTags;
    private readonly dockerVersionPattern;
    private readonly dockerTagPattern;
    canParse(tag: string): boolean;
    parse(tag: string): import("../types").ParserResult;
    protected reconstructVersion(info: VersionInfo, originalTag: string): string;
}
//# sourceMappingURL=docker.d.ts.map