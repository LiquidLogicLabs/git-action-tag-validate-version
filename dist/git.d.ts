/**
 * Get the most recent tag from the repository
 * Uses `git describe --tags --abbrev=0` to get the most recent tag
 */
export declare function getMostRecentTag(): Promise<string | null>;
/**
 * Check if a tag exists locally.
 * Uses execFile with argument array so tagName is never interpreted by the shell.
 */
export declare function tagExists(tagName: string): Promise<boolean>;
/**
 * Get a specific tag, validating it exists
 */
export declare function getTag(tagName: string): Promise<string | null>;
