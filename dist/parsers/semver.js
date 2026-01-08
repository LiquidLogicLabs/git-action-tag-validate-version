"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemverParser = void 0;
const base_1 = require("./base");
/**
 * Parser for Semantic Versioning (Semver) format
 * Supports: v1.2, 1.2, v1.2.3, 1.2.3, v1.2-alpha.1, 1.2.3-beta.2, v1.2.3+build.1, 1.2.3+20240115, v1.2.3-alpha.1+build.1
 */
class SemverParser extends base_1.BaseParser {
    // Semver pattern: optional 'v' prefix, major.minor (patch optional), optional prerelease, optional build metadata
    semverPattern = /^v?(\d+)\.(\d+)(?:\.(\d+))?(?:-([\w.-]+))?(?:\+([\w.-]+))?$/i;
    canParse(tag) {
        if (!this.semverPattern.test(tag)) {
            return false;
        }
        // Exclude calendar versioning patterns (YYYY.MM.DD or YY.MM.DD)
        // These should be handled by CalverParser, not SemverParser
        const calverLikePattern = /^(\d{2,4})\.(\d{1,2})(?:\.(\d{1,2}))?$/;
        const match = tag.match(calverLikePattern);
        if (match) {
            const [, yearStr, monthStr, dayStr] = match;
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);
            const fullYear = year < 100 ? 2000 + year : year;
            // If it looks like a valid date (year 2000-2099, month 1-12), exclude from semver
            if (fullYear >= 2000 && fullYear <= 2199 && month >= 1 && month <= 12) {
                // If it has a day component, definitely exclude (it's calver)
                if (dayStr !== undefined) {
                    const day = parseInt(dayStr, 10);
                    if (day >= 1 && day <= 31) {
                        return false; // This is calver, not semver
                    }
                }
                // If it's just year.month (2 parts), exclude if year is >= 2000
                // This prevents "2024.01" from being parsed as semver
                if (dayStr === undefined && fullYear >= 2000) {
                    return false; // Likely calver without day, not semver
                }
            }
        }
        return true;
    }
    parse(tag) {
        const match = tag.match(this.semverPattern);
        if (!match) {
            return this.createFailedResult(tag);
        }
        const [, major, minor, patch = '', prerelease = '', build = ''] = match;
        return this.createSuccessResult(tag, {
            major,
            minor,
            patch,
            prerelease,
            build,
        });
    }
    reconstructVersion(info, _originalTag) {
        // Normalize to 3 parts: add .0 if patch is missing
        const patch = info.patch || '0';
        let version = `${info.major}.${info.minor}.${patch}`;
        // Add prerelease if present
        // SemVer spec: prerelease identifiers must be dot-separated, not hyphen-separated
        if (info.prerelease) {
            // Normalize hyphens to dots in prerelease identifiers to conform to SemVer spec
            const normalizedPrerelease = info.prerelease.replace(/-/g, '.');
            version += `-${normalizedPrerelease}`;
        }
        // Add build metadata if present
        // SemVer spec: build metadata identifiers can be dot or hyphen separated
        if (info.build) {
            version += `+${info.build}`;
        }
        return version;
    }
}
exports.SemverParser = SemverParser;
//# sourceMappingURL=semver.js.map