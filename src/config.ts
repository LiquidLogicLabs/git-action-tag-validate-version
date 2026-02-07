import * as core from '@actions/core';

export type ParsedInputs = {
  tag: string;
  versionType: string;
  verbose: boolean;
};

export function getInputs(): ParsedInputs {
  const tag = core.getInput('tag');
  const versionType = core.getInput('versionType') || 'auto';
  const verboseInput = core.getBooleanInput('verbose');
  const envStepDebug = (process.env.ACTIONS_STEP_DEBUG || '').toLowerCase();
  const stepDebugEnabled = core.isDebug() || envStepDebug === 'true' || envStepDebug === '1';
  const verbose = verboseInput || stepDebugEnabled;

  return {
    tag,
    versionType,
    verbose,
  };
}
