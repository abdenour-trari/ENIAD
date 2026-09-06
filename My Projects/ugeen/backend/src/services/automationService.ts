import path from 'path';
import { AutomationState, AutomationStatus, StepName, WSMessage } from '../types';
import { logger } from './loggerService';
import { database } from './databaseService';
import config from '../config';

/**
 * Automation Service
 * Orchestrates the Playwright automation engine lifecycle.
 * Singleton pattern - manages start/stop/status of automation runs.
 */
class AutomationService {
  private state: AutomationState = {
    status: 'idle',
    currentStep: null,
    runId: null,
    logs: [],
    lastCode: null,
  };

  private abortController: AbortController | null = null;
  private automationProcess: any = null;

  /**
   * Get the current automation state
   */
  getState(): AutomationState {
    return { ...this.state };
  }

  /**
   * Start the automation workflow
   */
  async start(): Promise<void> {
    if (this.state.status === 'running') {
      throw new Error('Automation is already running');
    }

    // Reset state
    this.abortController = new AbortController();
    logger.clearLogs();
    this.state = {
      status: 'running',
      currentStep: null,
      runId: null,
      logs: [],
      lastCode: null,
    };

    // Create a new run in the database
    const runId = database.createRun();
    this.state.runId = runId;

    // Broadcast status update
    this.broadcastStatus();
    logger.info('🚀 Automation started', 'login');

    try {
      // Dynamically import the automation engine
      const enginePath = path.resolve(__dirname, '../../../automation/dist/engine.js');
      // Clear require cache to ensure fresh module
      delete require.cache[require.resolve(enginePath)];
      const { runAutomation } = require(enginePath);

      // Run the automation
      const result = await runAutomation({
        email: config.email,
        password: config.password,
        downloadPath: config.downloadPath,
        headless: config.headless,
        signal: this.abortController.signal,
        onLog: (level: string, message: string, step?: string) => {
          logger.log(level as any, message, step as StepName);
        },
        onStepChange: (step: StepName) => {
          this.state.currentStep = step;
          this.broadcastStatus();
        },
      });

      // Success
      this.state.status = 'success';
      this.state.lastCode = result.activationCode;
      this.state.currentStep = null;

      database.updateRun(runId, {
        status: 'success',
        activation_code: result.activationCode,
        file_path: result.filePath,
        logs: logger.getLogs(),
      });

      logger.success(`✨ Activation code extracted: ${result.activationCode}`);
      this.broadcastStatus();

      // Broadcast the extracted code
      logger.broadcast({
        type: 'code',
        payload: {
          code: result.activationCode,
          filePath: result.filePath,
          date: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      if (error.name === 'AbortError' || this.abortController?.signal.aborted) {
        this.state.status = 'cancelled';
        logger.warn('⚠️ Automation cancelled by user');
        database.updateRun(runId, {
          status: 'cancelled',
          logs: logger.getLogs(),
        });
      } else {
        this.state.status = 'error';
        logger.error(`❌ Automation failed: ${error.message}`);
        database.updateRun(runId, {
          status: 'error',
          error_message: error.message,
          logs: logger.getLogs(),
        });
      }

      this.state.currentStep = null;
      this.broadcastStatus();
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Stop the running automation
   */
  stop(): void {
    if (this.state.status !== 'running') {
      throw new Error('No automation is running');
    }

    if (this.abortController) {
      this.abortController.abort();
      logger.info('🛑 Stop signal sent');
    }
  }

  /**
   * Broadcast current status to all WebSocket clients
   */
  private broadcastStatus(): void {
    const statusMessage: WSMessage = {
      type: 'status',
      payload: {
        status: this.state.status,
        currentStep: this.state.currentStep,
        runId: this.state.runId,
        lastCode: this.state.lastCode,
      },
    };
    logger.broadcast(statusMessage);
  }
}

// Singleton instance
export const automationService = new AutomationService();
export default automationService;
