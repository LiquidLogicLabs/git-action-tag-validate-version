import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { tagExists } from '../git';

const execFileAsync = promisify(execFile);

/**
 * `tagExists` passed its input bare to `git rev-parse --verify --quiet`, which resolves ANY
 * ref — a branch, HEAD, or a raw SHA all report as existing tags. That is both a correctness
 * bug (the action's `tag-exists` output is wrong) and an argument-injection slot: a value
 * beginning with "-" is read by git as an option rather than as a ref.
 *
 * These run against a real temporary repository rather than a mock, because the defect is in
 * what git resolves, which a mock cannot show.
 */
describe('tagExists resolves tags only', () => {
  let repo: string;
  let cwd: string;

  beforeAll(async () => {
    repo = fs.mkdtempSync(path.join(os.tmpdir(), 'tagscope-'));
    await execFileAsync('git', ['init', '-q', '-b', 'main', '.'], { cwd: repo });
    await execFileAsync('git', ['-c', 'user.email=t@t.t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'c'], { cwd: repo });
    await execFileAsync('git', ['tag', 'v1.0.0'], { cwd: repo });
    cwd = process.cwd();
    process.chdir(repo);
  });

  afterAll(() => {
    process.chdir(cwd);
    fs.rmSync(repo, { recursive: true, force: true });
  });

  it('finds a real tag', async () => {
    await expect(tagExists('v1.0.0')).resolves.toBe(true);
  });

  it('does not report a BRANCH as an existing tag', async () => {
    await expect(tagExists('main')).resolves.toBe(false);
  });

  it('does not report HEAD as an existing tag', async () => {
    await expect(tagExists('HEAD')).resolves.toBe(false);
  });

  it('does not report a raw commit SHA as an existing tag', async () => {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repo });
    await expect(tagExists(stdout.trim())).resolves.toBe(false);
  });

  it('does not let a value git would read as an option through', async () => {
    // Qualifying as refs/tags/<name> means this can never occupy an option slot.
    await expect(tagExists('--all')).resolves.toBe(false);
  });

  it('still returns false for an absent tag', async () => {
    await expect(tagExists('v9.9.9')).resolves.toBe(false);
  });
});
