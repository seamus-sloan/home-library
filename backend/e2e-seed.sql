-- E2E Test Seed Data
-- This file contains static test data for E2E tests
-- It should be run against a fresh database after migrations

-- Clear existing data (in reverse order of dependencies)
DELETE FROM list_books;
DELETE FROM lists;
DELETE FROM reading_status;
DELETE FROM ratings;
DELETE FROM journal_entry_tags;
DELETE FROM book_tags;
DELETE FROM book_genres;
DELETE FROM journal_entries;
DELETE FROM books;
DELETE FROM tags;
DELETE FROM genres;
DELETE FROM users;

-- Reset autoincrement counters
DELETE FROM sqlite_sequence WHERE name IN ('users', 'books', 'tags', 'genres', 'journal_entries', 'book_tags', 'book_genres', 'journal_entry_tags', 'ratings', 'reading_status', 'lists', 'list_books');

-- Insert test users
INSERT INTO users (id, name, color, avatar_image, created_at, updated_at, last_login) VALUES
    (1, 'Test', '#3B82F6', NULL, datetime('now', '-30 days'), datetime('now', '-30 days'), datetime('now', '-1 day')),
    (2, 'Alice', '#EF4444', NULL, datetime('now', '-25 days'), datetime('now', '-25 days'), datetime('now', '-2 days')),
    (3, 'Bob', '#10B981', NULL, datetime('now', '-20 days'), datetime('now', '-20 days'), datetime('now', '-3 days'));

-- Insert test genres
INSERT INTO genres (id, name, color, user_id, created_at, updated_at) VALUES
    (1, 'Science Fiction', '#8B5CF6', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (2, 'Fantasy', '#F59E0B', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (3, 'Mystery', '#6366F1', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (4, 'Non-Fiction', '#14B8A6', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (5, 'Biography', '#EC4899', 1, datetime('now', '-28 days'), datetime('now', '-28 days'));

-- Insert test tags
INSERT INTO tags (id, user_id, name, color, created_at, updated_at) VALUES
    (1, 1, 'Favorite', '#DC2626', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (2, 1, 'To Reread', '#2563EB', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (3, 1, 'Classic', '#059669', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (4, 1, 'Award Winner', '#D97706', datetime('now', '-27 days'), datetime('now', '-27 days'));

-- Insert test books
INSERT INTO books (id, user_id, cover_image, title, author, description, series_name, series, created_at, updated_at) VALUES
    (1, 1, NULL, 'Dune', 'Frank Herbert', 'A sweeping space opera set on the desert planet Arrakis.', 'Dune Chronicles', '1', datetime('now', '-25 days'), datetime('now', '-25 days')),
    (2, 1, NULL, 'The Hobbit', 'J.R.R. Tolkien', 'A fantasy adventure about Bilbo Baggins.', NULL, NULL, datetime('now', '-24 days'), datetime('now', '-24 days')),
    (3, 1, NULL, 'Murder on the Orient Express', 'Agatha Christie', 'A classic murder mystery aboard a luxury train.', NULL, NULL, datetime('now', '-23 days'), datetime('now', '-23 days')),
    (4, 1, NULL, 'Sapiens', 'Yuval Noah Harari', 'A brief history of humankind.', NULL, NULL, datetime('now', '-22 days'), datetime('now', '-22 days')),
    (5, 1, NULL, 'Foundation', 'Isaac Asimov', 'The first book in the Foundation series.', 'Foundation', '1', datetime('now', '-21 days'), datetime('now', '-21 days')),
    (6, 2, NULL, 'Pride and Prejudice', 'Jane Austen', 'A classic romance novel.', NULL, NULL, datetime('now', '-20 days'), datetime('now', '-20 days'));

-- Associate books with genres
INSERT INTO book_genres (book_id, genre_id, created_at, updated_at) VALUES
    (1, 1, datetime('now', '-25 days'), datetime('now', '-25 days')), -- Dune -> Science Fiction
    (2, 2, datetime('now', '-24 days'), datetime('now', '-24 days')), -- The Hobbit -> Fantasy
    (3, 3, datetime('now', '-23 days'), datetime('now', '-23 days')), -- Murder on the Orient Express -> Mystery
    (4, 4, datetime('now', '-22 days'), datetime('now', '-22 days')), -- Sapiens -> Non-Fiction
    (5, 1, datetime('now', '-21 days'), datetime('now', '-21 days')); -- Foundation -> Science Fiction

-- Associate books with tags
INSERT INTO book_tags (book_id, tag_id, created_at, updated_at) VALUES
    (1, 1, datetime('now', '-25 days'), datetime('now', '-25 days')), -- Dune -> Favorite
    (1, 3, datetime('now', '-25 days'), datetime('now', '-25 days')), -- Dune -> Classic
    (2, 1, datetime('now', '-24 days'), datetime('now', '-24 days')), -- The Hobbit -> Favorite
    (2, 3, datetime('now', '-24 days'), datetime('now', '-24 days')), -- The Hobbit -> Classic
    (3, 3, datetime('now', '-23 days'), datetime('now', '-23 days')); -- Murder on the Orient Express -> Classic

-- Insert ratings (user 1 has rated some books)
INSERT INTO ratings (user_id, book_id, rating, created_at, updated_at) VALUES
    (1, 1, 5.0, datetime('now', '-20 days'), datetime('now', '-20 days')), -- Test rates Dune 5/5
    (1, 2, 4.5, datetime('now', '-19 days'), datetime('now', '-19 days')), -- Test rates The Hobbit 4.5/5
    (1, 3, 4.0, datetime('now', '-18 days'), datetime('now', '-18 days')), -- Test rates Murder 4/5
    (1, 5, 4.5, datetime('now', '-17 days'), datetime('now', '-17 days')); -- Test rates Foundation 4.5/5

-- Insert reading statuses
INSERT INTO reading_status (user_id, book_id, status_id, created_at, updated_at) VALUES
    (1, 1, 1, datetime('now', '-20 days'), datetime('now', '-20 days')), -- Test: Dune -> READ
    (1, 2, 1, datetime('now', '-19 days'), datetime('now', '-19 days')), -- Test: The Hobbit -> READ
    (1, 3, 1, datetime('now', '-18 days'), datetime('now', '-18 days')), -- Test: Murder -> READ
    (1, 4, 2, datetime('now', '-15 days'), datetime('now', '-15 days')), -- Test: Sapiens -> READING
    (1, 5, 1, datetime('now', '-17 days'), datetime('now', '-17 days')), -- Test: Foundation -> READ
    (2, 6, 2, datetime('now', '-10 days'), datetime('now', '-10 days')); -- Alice: Pride and Prejudice -> READING

-- Insert journal entries
INSERT INTO journal_entries (id, book_id, user_id, title, content, created_at, updated_at) VALUES
    (1, 1, 1, 'First thoughts on Dune', 'The world-building is incredible. Herbert creates such a rich universe.', datetime('now', '-20 days'), datetime('now', '-20 days')),
    (2, 2, 1, 'Journey through Middle-earth', 'Bilbo''s adventure is charming and full of wonder.', datetime('now', '-19 days'), datetime('now', '-19 days')),
    (3, 4, 1, 'Chapter 5 reflections', 'The agricultural revolution changed everything about human society.', datetime('now', '-10 days'), datetime('now', '-10 days'));

-- Associate journal entries with tags
INSERT INTO journal_entry_tags (journal_entry_id, tag_id, created_at, updated_at) VALUES
    (1, 1, datetime('now', '-20 days'), datetime('now', '-20 days')), -- Dune journal -> Favorite
    (2, 1, datetime('now', '-19 days'), datetime('now', '-19 days')); -- Hobbit journal -> Favorite

-- Insert lists
INSERT INTO lists (id, user_id, type_id, name, created_at, updated_at) VALUES
    (1, 1, 1, 'All-Time Favorites', datetime('now', '-15 days'), datetime('now', '-15 days')),
    (2, 1, 2, 'To Read Next', datetime('now', '-14 days'), datetime('now', '-14 days'));

-- Associate books with lists
INSERT INTO list_books (list_id, book_id, position, created_at) VALUES
    (1, 1, 1, datetime('now', '-15 days')), -- Dune in Favorites at position 1
    (1, 2, 2, datetime('now', '-15 days')), -- The Hobbit in Favorites at position 2
    (2, 4, 1, datetime('now', '-14 days')); -- Sapiens in To Read Next at position 1
