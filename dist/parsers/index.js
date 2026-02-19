"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserRegistry = void 0;
const types_1 = require("../types");
const semver_1 = require("./semver");
const simple_1 = require("./simple");
const docker_1 = require("./docker");
const calver_1 = require("./calver");
const date_based_1 = require("./date-based");
const regex_1 = require("./regex");
/**
 * Parser registry and routing logic
 */
class ParserRegistry {
    parsers = new Map();
    constructor(regexPattern) {
        // Initialize parsers
        this.parsers.set(types_1.VersionType.SEMVER, new semver_1.SemverParser());
        this.parsers.set(types_1.VersionType.SIMPLE, new simple_1.SimpleParser());
        this.parsers.set(types_1.VersionType.DOCKER, new docker_1.DockerParser());
        this.parsers.set(types_1.VersionType.CALVER, new calver_1.CalverParser());
        this.parsers.set(types_1.VersionType.DATE_BASED, new date_based_1.DateBasedParser());
        if (regexPattern) {
            this.parsers.set(types_1.VersionType.REGEX, new regex_1.RegexParser(regexPattern));
        }
    }
    /**
     * Get parser for a specific version type
     */
    getParser(versionType) {
        if (versionType === types_1.VersionType.AUTO) {
            return null; // Auto-detection handled separately
        }
        return this.parsers.get(versionType) || null;
    }
    /**
     * Auto-detect parser by trying each parser's canParse method
     * Returns the first parser that can handle the tag
     */
    autoDetectParser(tag) {
        // Try parsers in order of specificity (most specific first)
        const parserOrder = [
            types_1.VersionType.SEMVER,
            types_1.VersionType.CALVER,
            types_1.VersionType.DATE_BASED,
            types_1.VersionType.SIMPLE,
            types_1.VersionType.DOCKER,
        ];
        for (const type of parserOrder) {
            const parser = this.parsers.get(type);
            if (parser && parser.canParse(tag)) {
                return parser;
            }
        }
        return null;
    }
    /**
     * Parse a tag with the specified version type (or auto-detect)
     */
    parse(tag, versionType) {
        let parser;
        let detectedFormat;
        if (versionType === types_1.VersionType.AUTO) {
            parser = this.autoDetectParser(tag);
            if (!parser) {
                // No parser could handle it
                return {
                    isValid: false,
                    version: tag,
                    info: {
                        major: '',
                        minor: '',
                        patch: '',
                        prerelease: '',
                        build: '',
                    },
                    format: undefined,
                };
            }
            // Find which format was detected
            for (const [type, p] of this.parsers.entries()) {
                if (p === parser) {
                    detectedFormat = type;
                    break;
                }
            }
        }
        else {
            parser = this.getParser(versionType);
            if (!parser) {
                // Invalid versionType, fall back to auto
                parser = this.autoDetectParser(tag);
                if (!parser) {
                    return {
                        isValid: false,
                        version: tag,
                        info: {
                            major: '',
                            minor: '',
                            patch: '',
                            prerelease: '',
                            build: '',
                        },
                        format: undefined,
                    };
                }
                // Find which format was detected
                for (const [type, p] of this.parsers.entries()) {
                    if (p === parser) {
                        detectedFormat = type;
                        break;
                    }
                }
            }
            else {
                detectedFormat = versionType;
            }
        }
        const result = parser.parse(tag);
        return {
            ...result,
            format: detectedFormat,
        };
    }
}
exports.ParserRegistry = ParserRegistry;
//# sourceMappingURL=index.js.map