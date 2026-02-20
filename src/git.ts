import { exec, execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

/**
 * Get the most recent tag from the repository
 * Uses `git describe --tags --abbrev=0` to get the most recent tag
 */
export async function getMostRecentTag(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git describe --tags --abbrev=0', {
      maxBuffer: 1024 * 1024, // 1MB buffer
    });
    const tag = stdout.trim();
    return tag || null;
  } catch (error) {
    // No tags found or other error
    return null;
  }
}

/**
 * Check if a tag exists locally.
 * Uses execFile with argument array so tagName is never interpreted by the shell.
 */
export async function tagExists(tagName: string): Promise<boolean> {
  if (!tagName || tagName.trim() === '') {
    return false;
  }

  const trimmed = tagName.trim();
  try {
    await execFileAsync('git', ['rev-parse', '--verify', '--quiet', trimmed], {
      maxBuffer: 1024 * 1024,
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get a specific tag, validating it exists
 */
export async function getTag(tagName: string): Promise<string | null> {
  if (!tagName || tagName.trim() === '') {
    return null;
  }

  const exists = await tagExists(tagName);
  if (!exists) {
    return null;
  }

  return tagName.trim();
}

