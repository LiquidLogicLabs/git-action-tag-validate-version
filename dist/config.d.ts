export type ParsedInputs = {
    tag: string;
    versionType: string;
    versionRegex: string;
    verbose: boolean;
    debugMode: boolean;
};
export declare function getInputs(): ParsedInputs;
