"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalverParser = void 0;
const base_1 = require("./base");
/**
 * Parser for Calendar Versioning (Calver) format
 * Supports: 2024.01.15, 24.01.15, 2024.1.15, 2024.01.1
 */
class CalverParser extends base_1.BaseParser {
    // Calver pattern: YYYY or YY, MM, DD (with optional leading zeros)
    calverPattern = /^(\d{2,4})\.(\d{1,2})\.(\d{1,2})$/;
    canParse(tag) {
        if (!this.calverPattern.test(tag)) {
            return false;
        }
        // Validate that it's a reasonable date
        const match = tag.match(this.calverPattern);
        if (!match) {
            return false;
        }
        const [, yearStr, monthStr, dayStr] = match;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        // Normalize 2-digit years (assume 2000-2099)
        const fullYear = year < 100 ? 2000 + year : year;
        // Basic validation: reasonable year, valid month (1-12), valid day (1-31)
        return fullYear >= 2000 && fullYear <= 2099 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
    }
    parse(tag) {
        const match = tag.match(this.calverPattern);
        if (!match) {
            return this.createFailedResult(tag);
        }
        const [, yearStr, monthStr, dayStr] = match;
        const year = parseInt(yearStr, 10);
        const fullYear = year < 100 ? 2000 + year : year;
        return this.createSuccessResult(tag, {
            major: fullYear.toString(),
            minor: monthStr,
            patch: dayStr,
            prerelease: '',
            build: '',
        });
    }
    reconstructVersion(info, _originalTag) {
        // Reconstruct as YYYY.MM.DD with proper padding
        const year = info.major.padStart(4, '0'); // Ensure 4-digit year
        const month = info.minor.padStart(2, '0'); // Pad month to 2 digits
        const day = info.patch.padStart(2, '0'); // Pad day to 2 digits
        return `${year}.${month}.${day}`;
    }
}
exports.CalverParser = CalverParser;
//# sourceMappingURL=calver.js.map