"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateBasedParser = void 0;
const base_1 = require("./base");
/**
 * Parser for date-based version formats
 * Supports: 20240115 (YYYYMMDD), 2024-01-15 (YYYY-MM-DD), 2024/01/15 (YYYY/MM/DD)
 */
class DateBasedParser extends base_1.BaseParser {
    // Date patterns
    yyyymmddPattern = /^(\d{4})(\d{2})(\d{2})$/; // 20240115
    yyyyMmDdPattern = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/; // 2024-01-15, 2024-1-5, 2024/01/15, 2024/1/5
    canParse(tag) {
        if (this.yyyymmddPattern.test(tag)) {
            return this.isValidDate(tag.match(this.yyyymmddPattern));
        }
        if (this.yyyyMmDdPattern.test(tag)) {
            return this.isValidDate(tag.match(this.yyyyMmDdPattern));
        }
        return false;
    }
    isValidDate(match) {
        const [, yearStr, monthStr, dayStr] = match;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        // Basic validation: reasonable year, valid month (1-12), valid day (1-31)
        return year >= 2000 && year <= 2099 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
    }
    parse(tag) {
        let match = tag.match(this.yyyymmddPattern);
        if (!match) {
            match = tag.match(this.yyyyMmDdPattern);
        }
        if (!match) {
            return this.createFailedResult(tag);
        }
        const [, yearStr, monthStr, dayStr] = match;
        return this.createSuccessResult(tag, {
            major: yearStr,
            minor: monthStr,
            patch: dayStr,
            prerelease: '',
            build: '',
        });
    }
    reconstructVersion(info, _originalTag) {
        // Standardize to YYYY-MM-DD format with proper padding
        const year = info.major.padStart(4, '0'); // Ensure 4-digit year
        const month = info.minor.padStart(2, '0'); // Pad month to 2 digits
        const day = info.patch.padStart(2, '0'); // Pad day to 2 digits
        return `${year}-${month}-${day}`;
    }
}
exports.DateBasedParser = DateBasedParser;
//# sourceMappingURL=date-based.js.map