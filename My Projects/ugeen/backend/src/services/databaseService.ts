import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { AutomationRun, AutomationStatus, LogEntry } from '../types';

/**
 * Database Service
 * Handles all SQLite CRUD operations for automation run history.
 */
class DatabaseService {
  private db: Database.Database | null = null;

  /**
   * Initialize the database connection and create tables
   */
  init(): void {
    // Ensure database directory exists
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(config.databasePath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Read and execute schema
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
    } else {
      // Inline fallback schema
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS automation_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          started_at DATETIME NOT NULL DEFAULT (datetime('now')),
          completed_at DATETIME,
          status TEXT NOT NULL DEFAULT 'running',
          activation_code TEXT,
          file_path TEXT,
          error_message TEXT,
          logs TEXT DEFAULT '[]'
        );
        CREATE INDEX IF NOT EXISTS idx_runs_status ON automation_runs(status);
        CREATE INDEX IF NOT EXISTS idx_runs_started ON automation_runs(started_at DESC);
      `);
    }

    console.log('📦 Database initialized:', config.databasePath);
  }

  /**
   * Ensure DB is initialized
   */
  private getDb(): Database.Database {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }

  /**
   * Create a new automation run record
   */
  createRun(): number {
    const stmt = this.getDb().prepare(
      "INSERT INTO automation_runs (started_at, status) VALUES (datetime('now'), 'running')"
    );
    const result = stmt.run();
    return Number(result.lastInsertRowid);
  }

  /**
   * Update a run's status and optionally set completion data
   */
  updateRun(
    id: number,
    data: {
      status?: AutomationStatus;
      activation_code?: string;
      file_path?: string;
      error_message?: string;
      logs?: LogEntry[];
    }
  ): void {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status) {
      updates.push('status = ?');
      values.push(data.status);

      if (data.status === 'success' || data.status === 'error' || data.status === 'cancelled') {
        updates.push("completed_at = datetime('now')");
      }
    }

    if (data.activation_code !== undefined) {
      updates.push('activation_code = ?');
      values.push(data.activation_code);
    }

    if (data.file_path !== undefined) {
      updates.push('file_path = ?');
      values.push(data.file_path);
    }

    if (data.error_message !== undefined) {
      updates.push('error_message = ?');
      values.push(data.error_message);
    }

    if (data.logs !== undefined) {
      updates.push('logs = ?');
      values.push(JSON.stringify(data.logs));
    }

    if (updates.length === 0) return;

    values.push(id);
    const sql = `UPDATE automation_runs SET ${updates.join(', ')} WHERE id = ?`;
    this.getDb().prepare(sql).run(...values);
  }

  /**
   * Get all runs ordered by most recent first
   */
  getHistory(limit = 50): AutomationRun[] {
    return this.getDb()
      .prepare('SELECT * FROM automation_runs ORDER BY started_at DESC LIMIT ?')
      .all(limit) as AutomationRun[];
  }

  /**
   * Get the latest successful activation code
   */
  getLatestCode(): { code: string; date: string } | null {
    const row = this.getDb()
      .prepare(
        "SELECT activation_code, completed_at FROM automation_runs WHERE status = 'success' AND activation_code IS NOT NULL ORDER BY completed_at DESC LIMIT 1"
      )
      .get() as { activation_code: string; completed_at: string } | undefined;

    if (!row) return null;
    return { code: row.activation_code, date: row.completed_at };
  }

  /**
   * Get a specific run by ID
   */
  getRun(id: number): AutomationRun | null {
    return (
      (this.getDb()
        .prepare('SELECT * FROM automation_runs WHERE id = ?')
        .get(id) as AutomationRun) || null
    );
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const database = new DatabaseService();
export default database;
