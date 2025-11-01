-- Add migration script here

-- 1. Create list_types lookup table
CREATE TABLE IF NOT EXISTS list_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Insert default list types
INSERT INTO list_types (id, name) VALUES 
    (1, 'SEQUENCE'),
    (2, 'UNORDERED');

-- 2. Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES list_types (id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_type_id ON lists(type_id);

-- 3. Create list_books junction table (with position for ordering)
CREATE TABLE IF NOT EXISTS list_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    UNIQUE(list_id, book_id) -- Each book can only appear once per list
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_list_books_list_id ON list_books(list_id);
CREATE INDEX IF NOT EXISTS idx_list_books_book_id ON list_books(book_id);
CREATE INDEX IF NOT EXISTS idx_list_books_position ON list_books(list_id, position);
