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
