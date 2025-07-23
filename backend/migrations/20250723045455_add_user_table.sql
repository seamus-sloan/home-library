-- Create the users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT NULL
);

-- Insert the default users
INSERT INTO users (name, avatar_color) VALUES 
    ('Seamus', 'bg-blue-500'),
    ('Kelsey', 'bg-purple-500');

ALTER TABLE journal_entries
ADD COLUMN user_id INTEGER NOT NULL
REFERENCES users(id);

ALTER TABLE books
ADD COLUMN user_id INTEGER NOT NULL
REFERENCES users(id);