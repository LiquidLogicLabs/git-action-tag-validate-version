/**
 * Logger utility with verbose/debug support
 * Provides consistent logging across the action
 *
 * Two levels of extra output:
 *   verbose  (verbose=true OR debug=true) — useful operational detail
 *   debug    (debug=true only)            — full diagnostic detail
 */
export declare class Logger {
    readonly verbose: boolean;
    readonly debugMode: boolean;
    constructor(verbose?: boolean, debugMode?: boolean);
    /**
     * Log an info message
     */
    info(message: string): void;
    /**
     * Log a warning message
     */
    warning(message: string): void;
    /**
     * Log an error message
     */
    error(message: string): void;
    /**
     * Shown when verbose=true OR debug=true — useful operational detail
     */
    verboseInfo(message: string): void;
    /**
     * Shown when debug=true (ACTIONS_STEP_DEBUG) — full diagnostic detail
     * Falls back to core.debug() when debugMode is false (for when ACTIONS_STEP_DEBUG is set at workflow level)
     */
    debug(message: string): void;
    isVerbose(): boolean;
    isDebug(): boolean;
}
