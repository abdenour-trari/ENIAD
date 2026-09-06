import fs from 'fs';
import { StepContext } from '../types';
import { checkAbort } from '../utils/retryHelper';

/**
 * Step 5 — Parse & Extract Code
 *
 * 1. Read the downloaded .txt file
 * 2. Extract the first line
 * 3. Trim whitespace
 * 4. Validate length and format
 * 5. Return the activation code
 */
export async function executeParseStep(
  ctx: StepContext,
  filePath: string
): Promise<string> {
  const { config } = ctx;
  const log = config.onLog;

  checkAbort(config.signal);
  config.onStepChange('parse');

  log('step', 'Reading downloaded file...', 'parse');

  // Read the file
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  log('info', `File content length: ${content.length} characters`, 'parse');

  if (!content || content.trim().length === 0) {
    throw new Error('File is empty or contains only whitespace');
  }

  // Extract the first line
  const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error('No non-empty lines found in file');
  }

  const activationCode = lines[0].trim();

  // Validate the code
  log('info', `Extracted code: ${activationCode}`, 'parse');

  if (activationCode.length < 3) {
    log('warn', `Code seems too short (${activationCode.length} chars): "${activationCode}"`, 'parse');
  }

  if (activationCode.length > 500) {
    log('warn', `Code seems too long (${activationCode.length} chars), truncating...`, 'parse');
  }

  log('success', `Activation Code: ${activationCode}`, 'parse');

  // Log additional lines if present
  if (lines.length > 1) {
    log('info', `File contains ${lines.length} lines total`, 'parse');
  }

  return activationCode;
}
