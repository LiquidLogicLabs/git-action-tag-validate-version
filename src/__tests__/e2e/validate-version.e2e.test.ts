/**
 * E2E tests for Git Tag Validate Version action.
 * Runs the action in a real git repo and asserts outputs.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { run } from '../../index';

const originalEnv = { ...process.env };
const originalCwd = process.cwd();
let workDir: string;
let outputFile: string;

function execGit(args: string[], cwd?: string): string {
  const result = execFileSync('git', args, {
    cwd: cwd || workDir,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }) as unknown as string;
  return result.trim();
}

function parseGithubOutput(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const delim = line.indexOf('<<');
    if (delim > 0) {
      const key = line.slice(0, delim).trim();
      const endMarker = line.slice(delim + 2).trim() || 'EOF';
      const valueLines: string[] = [];
      i++;
      while (i < lines.length && lines[i] !== endMarker) {
        valueLines.push(lines[i]);
        i++;
      }
      out[key] = valueLines.join('\n');
      continue;
    }
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      out[key] = value;
    }
  }
  return out;
}

beforeAll(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tag-validate-e2e-'));
  execGit(['init'], workDir);
  execGit(['config', 'user.name', 'E2E User'], workDir);
  execGit(['config', 'user.email', 'e2e@example.com'], workDir);
  fs.writeFileSync(path.join(workDir, 'README.md'), '# E2E\n');
  execGit(['add', 'README.md'], workDir);
  execGit(['commit', '-m', 'init'], workDir);
});

afterAll(() => {
  process.chdir(originalCwd);
  process.env = originalEnv;
  if (workDir && fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
  if (outputFile && fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
});

beforeEach(() => {
  process.env = { ...originalEnv };
  process.chdir(workDir);
  outputFile = path.join(os.tmpdir(), `github_output_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(outputFile, '', 'utf-8');
  process.env.GITHUB_OUTPUT = outputFile;
  process.env.INPUT_VERBOSE = 'false';
  process.env.INPUT_VERSION_TYPE = 'auto';
  // Clear tag input so we use most recent, or set in test
  delete process.env.INPUT_TAG;
});

describe('E2E: validate version', () => {
  jest.setTimeout(15000);

  it('parses most recent semver tag and sets outputs', async () => {
    execGit(['tag', '-a', 'v1.2.3', '-m', 'release 1.2.3'], workDir);

    await run();

    const out = parseGithubOutput(outputFile);
    expect(out['is-valid']).toBe('true');
    expect(out.version).toBe('1.2.3');
    expect(out.format).toBe('semver');
    expect(out.major).toBe('1');
    expect(out.minor).toBe('2');
    expect(out.patch).toBe('3');
    expect(out['has-prerelease']).toBe('false');
  });

  it('parses specified tag when INPUT_TAG is set', async () => {
    execGit(['tag', '-a', 'v2.0.0', '-m', 'v2'], workDir);
    execGit(['tag', '-a', 'v1.0.0', '-m', 'v1'], workDir);
    process.env.INPUT_TAG = 'v2.0.0';

    await run();

    const out = parseGithubOutput(outputFile);
    expect(out['is-valid']).toBe('true');
    expect(out.version).toBe('2.0.0');
    expect(out.major).toBe('2');
    expect(out.minor).toBe('0');
    expect(out.patch).toBe('0');
  });

  it('sets is-valid false and empty version when no tags exist', async () => {
    // workDir has one tag from a previous test's beforeEach - we need a repo with no tags
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tag-validate-empty-'));
    execGit(['init'], emptyDir);
    execGit(['config', 'user.name', 'E2E'], emptyDir);
    execGit(['config', 'user.email', 'e@e.com'], emptyDir);
    fs.writeFileSync(path.join(emptyDir, 'f'), 'x');
    execGit(['add', 'f'], emptyDir);
    execGit(['commit', '-m', 'c'], emptyDir);
    process.chdir(emptyDir);
    const outPath = path.join(os.tmpdir(), `github_out_${Date.now()}`);
    fs.writeFileSync(outPath, '', 'utf-8');
    process.env.GITHUB_OUTPUT = outPath;

    await run();

    const out = parseGithubOutput(outPath);
    expect(out['is-valid']).toBe('false');
    expect(out.version).toBe('');
    process.chdir(workDir);
    fs.rmSync(emptyDir, { recursive: true, force: true });
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
  });

  it('parses prerelease semver tag', async () => {
    execGit(['tag', '-a', 'v3.0.0-beta.1', '-m', 'beta'], workDir);
    process.env.INPUT_TAG = 'v3.0.0-beta.1';

    await run();

    const out = parseGithubOutput(outputFile);
    expect(out['is-valid']).toBe('true');
    expect(out.version).toBe('3.0.0-beta.1');
    expect(out['has-prerelease']).toBe('true');
    expect(out.prerelease).toBe('beta.1');
  });
});
