-- One-line verdict and structured recipe details. Applied to the live database on 11 Nov 2026.
ALTER TABLE reviews ADD COLUMN verdict TEXT NOT NULL DEFAULT '';
ALTER TABLE reviews ADD COLUMN brew TEXT NOT NULL DEFAULT '{}';
