import * as core from '@actions/core';

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === '1';
}

export type ParsedInputs = {
  tag: string;
  versionType: string;
  verbose: boolean;
  debugMode: boolean;
};

export function getInputs(): ParsedInputs {
  const tag = core.getInput('tag');
  const versionType = core.getInput('version-type') || 'auto';
  const verboseInput = core.getBooleanInput('verbose');
  const debugMode =
    (typeof core.isDebug === 'function' && core.isDebug()) ||
    parseBoolean(process.env.ACTIONS_STEP_DEBUG) ||
    parseBoolean(process.env.ACTIONS_RUNNER_DEBUG) ||
    parseBoolean(process.env.RUNNER_DEBUG);
  const verbose = verboseInput || debugMode;

  return {
    tag,
    versionType,
    verbose,
    debugMode,
  };
}
