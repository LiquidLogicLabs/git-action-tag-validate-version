import * as core from '@actions/core';
import { getInputs } from './config';
import { VersionType } from './types';
import { ParserRegistry } from './parsers';
import { tagExists, getMostRecentTag } from './git';
import { extractCommit } from './utils/commit-extractor';
import { Logger } from './logger';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    const tagInput = inputs.tag;
    const versionTypeInput = inputs.versionType;

    // Create logger instance
    const logger = new Logger(inputs.verbose, inputs.debugMode);

    logger.verboseInfo(`Input tag: ${tagInput || '(empty - will use most recent)'}`);
    logger.verboseInfo(`Input version-type: ${versionTypeInput}`);
    if (inputs.versionRegex) {
      logger.verboseInfo(`Input version-regex: ${inputs.versionRegex}`);
    }

    // Get tag (from input or most recent)
    let tag: string | null = null;
    let tagExistsLocally: boolean | null = null; // only set when tag input was provided

    if (tagInput && tagInput.trim() !== '') {
      tag = tagInput.trim();
      logger.verboseInfo(`Using specified tag: ${tag}`);
      tagExistsLocally = await tagExists(tag);
      if (!tagExistsLocally) {
        logger.warning(`Tag '${tag}' not found in repository; parsing tag string only.`);
      } else {
        logger.info(`Found tag: ${tag}`);
      }
    } else {
      logger.verboseInfo(`No tag specified, getting most recent tag`);
      tag = await getMostRecentTag();
      if (!tag) {
        logger.warning(`No tags found in repository`);
        // No tags exist - set outputs to empty
        setEmptyOutputs();
        return;
      }
      logger.info(`Using most recent tag: ${tag}`);
    }

    // Parse version type
    let versionType: VersionType;
    try {
      versionType = versionTypeInput.toLowerCase() as VersionType;
      if (!Object.values(VersionType).includes(versionType)) {
        logger.verboseInfo(`Invalid version-type '${versionTypeInput}', falling back to auto`);
        versionType = VersionType.AUTO;
      }
    } catch (error) {
      logger.verboseInfo(`Error parsing version-type, falling back to auto`);
      versionType = VersionType.AUTO;
    }

    // Guard: regex type requires a pattern
    if (versionType === VersionType.REGEX && !inputs.versionRegex) {
      core.setFailed(`version-type is 'regex' but no version-regex pattern was provided`);
      return;
    }

    // Parse version
    const parserRegistry = new ParserRegistry(inputs.versionRegex || undefined);
    logger.debug(`Parsing tag '${tag}' with version-type '${versionType}'`);
    const parseResult = parserRegistry.parse(tag, versionType);

    if (parseResult.isValid) {
      logger.info(`✓ Successfully parsed version: ${parseResult.version} (format: ${parseResult.format || 'unknown'})`);
    } else {
      logger.warning(`⚠ Failed to parse tag '${tag}' as valid version`);
    }

    logger.debug(`Parse result: isValid=${parseResult.isValid}`);
    logger.debug(`Version components: major=${parseResult.info.major}, minor=${parseResult.info.minor}, patch=${parseResult.info.patch}`);
    if (parseResult.info.prerelease) {
      logger.debug(`Prerelease: ${parseResult.info.prerelease}`);
    }
    if (parseResult.info.build) {
      logger.debug(`Build: ${parseResult.info.build}`);
    }

    // Extract commit SHA
    const commit = extractCommit(tag);
    if (commit) {
      logger.debug(`Extracted commit SHA: ${commit}`);
    } else {
      logger.debug(`No commit SHA found in tag`);
    }

    // Extract format-specific information
    const format = parseResult.format || '';
    let year = '';
    let month = '';
    let day = '';
    let hasPrerelease = 'false';
    let hasBuild = 'false';

    if (parseResult.format === VersionType.CALVER || parseResult.format === VersionType.DATE_BASED) {
      // For calver and date-based, major=year, minor=month, patch=day
      year = parseResult.info.major;
      month = parseResult.info.minor;
      day = parseResult.info.patch;
    }

    if (parseResult.format === VersionType.SEMVER) {
      hasPrerelease = parseResult.info.prerelease ? 'true' : 'false';
      hasBuild = parseResult.info.build ? 'true' : 'false';
    }

    logger.debug(`Detected format: ${format}`);
    if (year) {
      logger.debug(`Date components: year=${year}, month=${month}, day=${day}`);
    }
    if (parseResult.format === VersionType.SEMVER) {
      logger.debug(`Semver flags: has-prerelease=${hasPrerelease}, has-build=${hasBuild}`);
    }

    // Set outputs
    core.setOutput('is-valid', parseResult.isValid.toString());
    core.setOutput('version', parseResult.version);
    core.setOutput('format', format);
    core.setOutput('major', parseResult.info.major);
    core.setOutput('minor', parseResult.info.minor);
    core.setOutput('patch', parseResult.info.patch);
    core.setOutput('prerelease', parseResult.info.prerelease);
    core.setOutput('build', parseResult.info.build);
    core.setOutput('commit', commit);
    core.setOutput('year', year);
    core.setOutput('month', month);
    core.setOutput('day', day);
    core.setOutput('has-prerelease', hasPrerelease);
    core.setOutput('has-build', hasBuild);
    if (tagExistsLocally !== null) {
      core.setOutput('tag-exists', tagExistsLocally.toString());
    }

    // Output summary showing the parsed version (this is what will be in the output)
    if (parseResult.isValid) {
      logger.info(`📦 Version output: ${parseResult.version}`);
      logger.info(`   Format: ${format}`);
      if (parseResult.info.major) {
        logger.info(`   Components: ${parseResult.info.major}.${parseResult.info.minor || '0'}.${parseResult.info.patch || '0'}`);
      }
    } else {
      logger.warning(`⚠ Version output (original tag): ${parseResult.version}`);
    }

    logger.debug('Action completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error occurred');
    }
  }
}

/**
 * Set all outputs to empty/invalid state
 */
function setEmptyOutputs(): void {
  core.setOutput('is-valid', 'false');
  core.setOutput('version', '');
  core.setOutput('format', '');
  core.setOutput('major', '');
  core.setOutput('minor', '');
  core.setOutput('patch', '');
  core.setOutput('prerelease', '');
  core.setOutput('build', '');
  core.setOutput('commit', '');
  core.setOutput('year', '');
  core.setOutput('month', '');
  core.setOutput('day', '');
  core.setOutput('has-prerelease', 'false');
  core.setOutput('has-build', 'false');
}

// Run the action when executed as main (not when required from tests)
if (typeof require !== 'undefined' && require.main === module) {
  run();
}

export { run };
