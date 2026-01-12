"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerParser = void 0;
const base_1 = require("./base");
/**
 * Parser for Docker tag formats
 * Supports: latest, stable, 1.2.3, v1.2.3, 1.2.3-alpine, v1.2.3-ubuntu, 1.2.3-alpine-3.18
 */
class DockerParser extends base_1.BaseParser {
    // Special tags that don't have numeric components
    specialTags = ['latest', 'stable', 'dev', 'test', 'prod', 'production', 'staging'];
    // Docker tag pattern: optional 'v' prefix, version numbers, optional suffixes with hyphens
    dockerVersionPattern = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([\w.-]+))?$/i;
    // Docker tag character constraints (not a version schema):
    // - 1 to 128 chars
    // - first char: [A-Za-z0-9_]
    // - remaining: [A-Za-z0-9_.-]
    // Matches Docker's documented tag grammar: /[\w][\w.-]{0,127}/
    dockerTagPattern = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
    canParse(tag) {
        // Accept special tags, version-like tags, or any valid docker tag (opaque tags)
        const lowerTag = tag.toLowerCase();
        return this.specialTags.includes(lowerTag) || this.dockerVersionPattern.test(tag) || this.dockerTagPattern.test(tag);
    }
    parse(tag) {
        const lowerTag = tag.toLowerCase();
        // Handle special tags
        if (this.specialTags.includes(lowerTag)) {
            return this.createSuccessResult(tag, {
                major: '',
                minor: '',
                patch: '',
                prerelease: '',
                build: '',
            });
        }
        // Try to parse as version
        const match = tag.match(this.dockerVersionPattern);
        if (!match) {
            // If it's a valid docker tag but not version-like, treat it as an opaque tag.
            // For opaque tags, return the root segment (before first '-') as `version`,
            // and store the remainder (if any) in `prerelease`.
            if (!this.dockerTagPattern.test(tag)) {
                return this.createFailedResult(tag);
            }
            const dashIndex = tag.indexOf('-');
            const remainder = dashIndex === -1 ? '' : tag.slice(dashIndex + 1);
            return this.createSuccessResult(tag, {
                major: '',
                minor: '',
                patch: '',
                prerelease: remainder,
                build: '',
            });
        }
        const [, major, minor = '', patch = '', suffix = ''] = match;
        return this.createSuccessResult(tag, {
            major,
            minor,
            patch,
            prerelease: suffix,
            build: '',
        });
    }
    reconstructVersion(info, originalTag) {
        // Special tags (latest, stable, etc.) - keep original tag
        const lowerTag = originalTag.toLowerCase();
        if (this.specialTags.includes(lowerTag)) {
            return originalTag;
        }
        // Opaque docker tags: root is everything before the first '-'
        if (!info.major) {
            const dashIndex = originalTag.indexOf('-');
            return dashIndex === -1 ? originalTag : originalTag.slice(0, dashIndex);
        }
        // Version-like tags: normalize to 3 parts if patch missing, add suffix
        const patch = info.patch || '0';
        let version = `${info.major}.${info.minor}.${patch}`;
        // Add suffix (stored in prerelease field) if present
        if (info.prerelease) {
            version += `-${info.prerelease}`;
        }
        return version;
    }
}
exports.DockerParser = DockerParser;
//# sourceMappingURL=docker.js.map