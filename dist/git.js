"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostRecentTag = getMostRecentTag;
exports.tagExists = tagExists;
exports.getTag = getTag;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Get the most recent tag from the repository
 * Uses `git describe --tags --abbrev=0` to get the most recent tag
 */
async function getMostRecentTag() {
    try {
        const { stdout } = await execAsync('git describe --tags --abbrev=0', {
            maxBuffer: 1024 * 1024, // 1MB buffer
        });
        const tag = stdout.trim();
        return tag || null;
    }
    catch (error) {
        // No tags found or other error
        return null;
    }
}
/**
 * Check if a tag exists locally.
 * Uses execFile with argument array so tagName is never interpreted by the shell.
 */
async function tagExists(tagName) {
    if (!tagName || tagName.trim() === '') {
        return false;
    }
    const trimmed = tagName.trim();
    try {
        await execFileAsync('git', ['rev-parse', '--verify', '--quiet', trimmed], {
            maxBuffer: 1024 * 1024,
        });
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Get a specific tag, validating it exists
 */
async function getTag(tagName) {
    if (!tagName || tagName.trim() === '') {
        return null;
    }
    const exists = await tagExists(tagName);
    if (!exists) {
        return null;
    }
    return tagName.trim();
}
//# sourceMappingURL=git.js.map