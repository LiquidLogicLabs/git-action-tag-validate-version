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
    catch {
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
        // Qualified as refs/tags/<name> for two reasons. It resolves TAGS only: the bare form
        // accepts a branch, HEAD or a raw SHA, so `tagExists('main')` returned true and the
        // action's tag-exists output was wrong. And a qualified ref can never begin with "-",
        // so the value cannot occupy an option slot in git's argument parser.
        await execFileAsync('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${trimmed}`], {
            maxBuffer: 1024 * 1024,
        });
        return true;
    }
    catch {
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