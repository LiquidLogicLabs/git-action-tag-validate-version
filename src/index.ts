import * as core from '@actions/core';
import { VersionType } from './types';
import { ParserRegistry } from './parsers';
import { getTag, getMostRecentTag } from './git';
import { extractCommit } from './utils/commit-extractor';
import { Logger } from './logger';

async function run(): Promise<void> {
  try {
    // Get inputs
    const tagInput = core.getInput('tag');
    const versionTypeInput = core.getInput('versionType') || 'auto';
    const verboseInput = core.getInput('verbose') || 'false';
    const verbose = verboseInput.toLowerCase() === 'true';

    // Create logger instance
    const logger = new Logger(verbose);

    logger.debug(`Input tag: ${tagInput || '(empty - will use most recent)'}`);
    logger.debug(`Input versionType: ${versionTypeInput}`);

    // Get tag (from input or most recent)
    let tag: string | null = null;

    if (tagInput && tagInput.trim() !== '') {
      logger.debug(`Looking for specified tag: ${tagInput}`);
      tag = await getTag(tagInput.trim());
      if (!tag) {
        logger.warning(`Tag '${tagInput}' not found`);
        // Tag not found - set outputs to empty
        setEmptyOutputs();
        return;
      }
      logger.info(`Found tag: ${tag}`);
    } else {
      logger.debug(`No tag specified, getting most recent tag`);
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
        logger.debug(`Invalid versionType '${versionTypeInput}', falling back to auto`);
        versionType = VersionType.AUTO;
      }
    } catch (error) {
      logger.debug(`Error parsing versionType, falling back to auto`);
      versionType = VersionType.AUTO;
    }

    // Parse version
    const parserRegistry = new ParserRegistry();
    logger.debug(`Parsing tag '${tag}' with versionType '${versionType}'`);
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
      logger.debug(`Semver flags: hasPrerelease=${hasPrerelease}, hasBuild=${hasBuild}`);
    }

    // Set outputs
    core.setOutput('isValid', parseResult.isValid.toString());
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
    core.setOutput('hasPrerelease', hasPrerelease);
    core.setOutput('hasBuild', hasBuild);

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
  core.setOutput('isValid', 'false');
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
  core.setOutput('hasPrerelease', 'false');
  core.setOutput('hasBuild', 'false');
}

// Run the action
run();

