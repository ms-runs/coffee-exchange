-- Reviews: one per person per coffee (saving again updates it). Applied to the live database on 11 Nov 2026.
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL,
  by_name TEXT NOT NULL,
  by_key TEXT NOT NULL,
  city TEXT,
  date TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  tasting TEXT NOT NULL DEFAULT '[]',
  profile TEXT NOT NULL DEFAULT '{}',
  method TEXT NOT NULL DEFAULT '[]',
  recipe TEXT NOT NULL DEFAULT '',
  again TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (number, by_key)
);
CREATE INDEX IF NOT EXISTS reviews_number ON reviews (number);
