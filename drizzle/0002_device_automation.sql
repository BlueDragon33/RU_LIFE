CREATE TABLE IF NOT EXISTS ru_life_automation (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  auto_approve_devices INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
