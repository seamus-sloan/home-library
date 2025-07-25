-- Create tags table
-- This will be used to allow users to tag books and journal entries
-- so that they can be searched and filtered easily
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create join table for books and tags
CREATE TABLE book_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

-- Create join table for journal entries and tags
CREATE TABLE journal_entry_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);
