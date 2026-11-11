-- Settings, e.g. the group code's SHA-256 (lower-cased, trimmed). Applied to the live database on 11 Nov 2026.
-- Change the code: UPDATE settings SET value = '<sha256 of new code>', updated_at = datetime('now') WHERE key = 'group_code_sha256';
-- Remove it (anyone can post): DELETE FROM settings WHERE key = 'group_code_sha256';
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')));
