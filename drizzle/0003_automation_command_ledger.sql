ALTER TABLE ru_life_automation ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS ru_life_automation_commands (
  command_id TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  state TEXT DEFAULT 'processing' NOT NULL,
  result_json TEXT,
  actor TEXT NOT NULL,
  control_device_id TEXT,
  ticket_id TEXT,
  execution_nonce TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TEXT
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS ru_life_automation_commands_created_idx
  ON ru_life_automation_commands(created_at DESC);
