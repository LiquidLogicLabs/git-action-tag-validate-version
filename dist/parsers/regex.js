"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexParser = void 0;
const types_1 = require("../types");
const base_1 = require("./base");
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
class RegexParser extends base_1.BaseParser {
    pattern;
    constructor(pattern) {
        super();
        // Throws SyntaxError on invalid pattern — propagates to core.setFailed() in index.ts
        this.pattern = new RegExp(pattern);
    }
    canParse(tag) {
        return this.pattern.test(tag);
    }
    parse(tag) {
        const match = tag.match(this.pattern);
        if (!match)
            return this.createFailedResult(tag);
        const groups = match.groups ?? {};
        const info = {
            major: groups['major'] ?? match[1] ?? '',
            minor: groups['minor'] ?? match[2] ?? '',
            patch: groups['patch'] ?? match[3] ?? '',
            prerelease: groups['prerelease'] ?? match[4] ?? '',
            build: groups['build'] ?? match[5] ?? '',
        };
        const result = this.createSuccessResult(tag, info);
        return { ...result, format: types_1.VersionType.REGEX };
    }
    reconstructVersion(info, originalTag) {
        const base = [info.major, info.minor, info.patch].filter(Boolean).join('.');
        if (!base)
            return originalTag.replace(/^v/, '');
        let version = base;
        if (info.prerelease)
            version += `-${info.prerelease}`;
        if (info.build)
            version += `+${info.build}`;
        return version;
    }
}
exports.RegexParser = RegexParser;
//# sourceMappingURL=regex.js.map