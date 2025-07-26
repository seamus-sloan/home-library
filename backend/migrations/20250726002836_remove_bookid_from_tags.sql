-- Drop book_id column since it was added erroneously...
-- SQLite doesn't support DROP COLUMN with foreign keys, so we need to recreate the table

-- Create new table without book_id
CREATE TABLE tags_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Copy data from old table (excluding book_id)
INSERT INTO tags_new (id, user_id, name, color, created_at, updated_at)
SELECT id, user_id, name, color, created_at, updated_at FROM tags;

-- Drop the old table and rename the new one
DROP TABLE tags;
ALTER TABLE tags_new RENAME TO tags;

-- Recreate the unique index
CREATE UNIQUE INDEX unique_tag_name ON tags (name);