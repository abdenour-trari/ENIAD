import { Router, Request, Response } from 'express';
import { automationService } from '../services/automationService';
import { database } from '../services/databaseService';

const router = Router();

/**
 * POST /api/automation/start
 * Start the automation workflow
 */
router.post('/start', async (_req: Request, res: Response) => {
  try {
    const state = automationService.getState();
    if (state.status === 'running') {
      return res.status(409).json({
        success: false,
        message: 'Automation is already running',
      });
    }

    // Start the automation asynchronously
    automationService.start().catch((err) => {
      console.error('Automation error:', err);
    });

    res.json({
      success: true,
      message: 'Automation started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/automation/stop
 * Stop the running automation
 */
router.post('/stop', (_req: Request, res: Response) => {
  try {
    automationService.stop();
    res.json({
      success: true,
      message: 'Stop signal sent',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/automation/status
 * Get the current automation status
 */
router.get('/status', (_req: Request, res: Response) => {
  const state = automationService.getState();
  res.json({
    success: true,
    data: state,
  });
});

/**
 * GET /api/automation/history
 * Get the history of all automation runs
 */
router.get('/history', (_req: Request, res: Response) => {
  try {
    const limit = parseInt((_req.query.limit as string) || '50', 10);
    const history = database.getHistory(limit);
    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/automation/latest-code
 * Get the last extracted activation code
 */
router.get('/latest-code', (_req: Request, res: Response) => {
  try {
    const result = database.getLatestCode();
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
