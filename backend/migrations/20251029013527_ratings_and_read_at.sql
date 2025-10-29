-- Add migration script here

-- 1. Create status lookup table first (referenced by reading_status)
CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Insert status values
INSERT INTO status (id, name) VALUES 
    (0, 'UNREAD'),
    (1, 'READ'),
    (2, 'READING');

-- 2. Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rating REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    UNIQUE(user_id, book_id) -- One rating per user per book
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);

-- 3. Migrate existing book ratings to ratings table (with user_id = 1)
INSERT INTO ratings (user_id, book_id, rating)
SELECT 1, id, rating
FROM books
WHERE rating IS NOT NULL;

-- 4. Create reading_status table
CREATE TABLE IF NOT EXISTS reading_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    status_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status (id),
    UNIQUE(user_id, book_id) -- One status per user per book
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reading_status_user_id ON reading_status(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_status_book_id ON reading_status(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_status_status_id ON reading_status(status_id);

-- 5. Remove rating column from books table (since it's now in ratings table)
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
PRAGMA foreign_keys = OFF;

-- Store existing relationships temporarily
CREATE TEMPORARY TABLE temp_book_tags AS SELECT * FROM book_tags;
CREATE TEMPORARY TABLE temp_journal_entries AS SELECT * FROM journal_entries;
CREATE TEMPORARY TABLE temp_journal_entry_tags AS SELECT * FROM journal_entry_tags;
CREATE TEMPORARY TABLE temp_book_genres AS SELECT * FROM book_genres;

-- Drop tables that reference books or journal_entries
DROP TABLE book_tags;
DROP TABLE journal_entry_tags;
DROP TABLE journal_entries;
DROP TABLE book_genres;

-- Create new books table without rating column
CREATE TABLE books_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cover_image TEXT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    series_name TEXT,
    series TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Copy data from old table (excluding rating column)
INSERT INTO books_new (id, user_id, cover_image, title, author, description, series_name, series, created_at, updated_at)
SELECT id, user_id, cover_image, title, author, description, series_name, series, created_at, updated_at
FROM books;

-- Drop old table
DROP TABLE books;

-- Rename new table
ALTER TABLE books_new RENAME TO books;

-- Recreate journal_entries table
CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Restore journal_entries data
INSERT INTO journal_entries (id, book_id, user_id, title, content, created_at, updated_at)
SELECT id, book_id, user_id, title, content, created_at, updated_at
FROM temp_journal_entries;

-- Recreate book_tags table
CREATE TABLE book_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

-- Restore book_tags data
INSERT INTO book_tags (id, book_id, tag_id, created_at, updated_at)
SELECT id, book_id, tag_id, created_at, updated_at
FROM temp_book_tags;

-- Recreate book_genres table
CREATE TABLE book_genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (genre_id) REFERENCES genres (id),
    UNIQUE(book_id, genre_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre_id ON book_genres(genre_id);

-- Restore book_genres data
INSERT INTO book_genres (id, book_id, genre_id, created_at, updated_at)
SELECT id, book_id, genre_id, created_at, updated_at
FROM temp_book_genres;

-- Recreate journal_entry_tags table
CREATE TABLE journal_entry_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

-- Restore journal_entry_tags data
INSERT INTO journal_entry_tags (id, journal_entry_id, tag_id, created_at, updated_at)
SELECT id, journal_entry_id, tag_id, created_at, updated_at
FROM temp_journal_entry_tags;

-- 6. Set default reading status for existing books
-- Books with ratings -> READ (status_id = 1)
INSERT INTO reading_status (user_id, book_id, status_id)
SELECT 1, id, 1
FROM books
WHERE id IN (SELECT book_id FROM ratings WHERE user_id = 1);

-- Books without ratings -> UNREAD (status_id = 0)
INSERT INTO reading_status (user_id, book_id, status_id)
SELECT 1, id, 0
FROM books
WHERE id NOT IN (SELECT book_id FROM ratings WHERE user_id = 1);

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
