"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleParser = void 0;
const base_1 = require("./base");
/**
 * Parser for simple versioning format
 * Supports: 1.2, 1.2.3, 1.2.3.4, v1.2, v1.2.3
 */
class SimpleParser extends base_1.BaseParser {
    // Simple version pattern: optional 'v' prefix, 2-4 numeric components separated by dots
    simplePattern = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?$/;
    canParse(tag) {
        return this.simplePattern.test(tag);
    }
    parse(tag) {
        const match = tag.match(this.simplePattern);
        if (!match) {
            return this.createFailedResult(tag);
        }
        const [, major, minor = '', patch = '', fourth = ''] = match;
        // Store 4th part in build field if present (since VersionInfo doesn't have a 4th field)
        // We'll reconstruct from original tag if 4 parts exist
        const hasFourthPart = fourth !== '';
        return this.createSuccessResult(tag, {
            major,
            minor,
            patch,
            prerelease: '',
            build: hasFourthPart ? fourth : '', // Temporarily store 4th part here
        });
    }
    reconstructVersion(info, _originalTag) {
        // Build version from non-empty components (2-4 parts)
        const parts = [info.major];
        if (info.minor)
            parts.push(info.minor);
        if (info.patch)
            parts.push(info.patch);
        // If build field contains a 4th part (numeric), add it
        if (info.build && /^\d+$/.test(info.build)) {
            parts.push(info.build);
        }
        return parts.join('.');
    }
}
exports.SimpleParser = SimpleParser;
//# sourceMappingURL=simple.js.map