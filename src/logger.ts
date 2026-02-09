import * as core from '@actions/core';

/**
 * Logger utility with verbose/debug support
 * Provides consistent logging across the action
 *
 * Two levels of extra output:
 *   verbose  (verbose=true OR debug=true) — useful operational detail
 *   debug    (debug=true only)            — full diagnostic detail
 */
export class Logger {
  public readonly verbose: boolean;
  public readonly debugMode: boolean;

  constructor(verbose: boolean = false, debugMode: boolean = false) {
    this.verbose = verbose || debugMode;
    this.debugMode = debugMode;
  }

  /**
   * Log an info message
   */
  info(message: string): void {
    core.info(message);
  }

  /**
   * Log a warning message
   */
  warning(message: string): void {
    core.warning(message);
  }

  /**
   * Log an error message
   */
  error(message: string): void {
    core.error(message);
  }

  /**
   * Shown when verbose=true OR debug=true — useful operational detail
   */
  verboseInfo(message: string): void {
    if (this.verbose) {
      core.info(message);
    }
  }

  /**
   * Shown when debug=true (ACTIONS_STEP_DEBUG) — full diagnostic detail
   * Falls back to core.debug() when debugMode is false (for when ACTIONS_STEP_DEBUG is set at workflow level)
   */
  debug(message: string): void {
    if (this.debugMode) {
      core.info(`[DEBUG] ${message}`);
    } else {
      core.debug(message);
    }
  }

  isVerbose(): boolean {
    return this.verbose;
  }

  isDebug(): boolean {
    return this.debugMode;
  }
}
