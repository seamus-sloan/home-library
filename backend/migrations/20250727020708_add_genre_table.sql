-- Disable foreign key constraints during migration
PRAGMA foreign_keys = OFF;

-- Create genre table
CREATE TABLE IF NOT EXISTS genre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Migrate existing genre data from books table
-- First, create genre entries for all existing unique genres
INSERT OR IGNORE INTO genre (name, color, user_id)
SELECT DISTINCT 
    books.genre,
    '#6b7280', -- Default gray color, you might want to customize this
    books.user_id
FROM books 
WHERE books.genre IS NOT NULL AND books.genre != '';

-- Create a temporary table to store book-genre relationships before we drop the books table
CREATE TEMPORARY TABLE temp_book_genres AS
SELECT DISTINCT
    b.id as book_id,
    g.id as genre_id
FROM books b
JOIN genre g ON b.genre = g.name AND b.user_id = g.user_id
WHERE b.genre IS NOT NULL AND b.genre != '';

-- Also need to temporarily store book_tags data since it references books
CREATE TEMPORARY TABLE temp_book_tags AS
SELECT * FROM book_tags;

-- Also need to temporarily store journal_entries data since it references books
CREATE TEMPORARY TABLE temp_journal_entries AS
SELECT * FROM journal_entries;

-- Drop tables that reference books first
DROP TABLE book_tags;
DROP TABLE journal_entries;

-- Remove the old genre column from books table
-- Step 1: Create new books table without genre column
CREATE TABLE books_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cover_image TEXT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    rating REAL DEFAULT NULL,
    description TEXT,
    series_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Step 2: Copy data from old table (excluding genre column)
INSERT INTO books_new (id, user_id, cover_image, title, author, rating, description, series_name, created_at, updated_at)
SELECT id, user_id, cover_image, title, author, rating, description, series_name, created_at, updated_at
FROM books;

-- Step 3: Drop old table
DROP TABLE books;

-- Step 4: Rename new table
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

-- NOW create join table for books and genres (after books table is recreated)
CREATE TABLE IF NOT EXISTS book_genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (genre_id) REFERENCES genre (id),
    UNIQUE(book_id, genre_id) -- Prevent duplicate book-genre relationships
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre_id ON book_genres(genre_id);

-- Restore book_genres relationships from temporary table
INSERT OR IGNORE INTO book_genres (book_id, genre_id)
SELECT book_id, genre_id FROM temp_book_genres;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;