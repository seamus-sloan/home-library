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
    (5, 'Biography', '#EC4899', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (6, 'Historical Fiction', '#F97316', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (7, 'Thriller', '#DC2626', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (8, 'Romance', '#DB2777', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (9, 'Horror', '#7C2D12', 1, datetime('now', '-28 days'), datetime('now', '-28 days')),
    (10, 'Philosophy', '#475569', 1, datetime('now', '-28 days'), datetime('now', '-28 days'));

-- Insert test tags
INSERT INTO tags (id, user_id, name, color, created_at, updated_at) VALUES
    (1, 1, 'Favorite', '#DC2626', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (2, 1, 'To Reread', '#2563EB', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (3, 1, 'Classic', '#059669', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (4, 1, 'Award Winner', '#D97706', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (5, 1, 'Page Turner', '#EA580C', datetime('now', '-27 days'), datetime('now', '-27 days')),
    (6, 1, 'Thought Provoking', '#7E22CE', datetime('now', '-27 days'), datetime('now', '-27 days'));

-- Insert test books (50+ books with variety of cover images and reading statuses)
-- Note: Cover images are fetched from bookcover.longitood.com API (real Goodreads URLs)
INSERT INTO books (id, user_id, cover_image, title, author, description, series_name, series, created_at, updated_at) VALUES
    -- Books with cover images (READ by Test user)
    (1, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg', 'Dune', 'Frank Herbert', 'A sweeping space opera set on the desert planet Arrakis.', 'Dune Chronicles', '1', datetime('now', '-25 days'), datetime('now', '-25 days')),
    (2, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg', 'The Hobbit', 'J.R.R. Tolkien', 'A fantasy adventure about Bilbo Baggins.', NULL, NULL, datetime('now', '-24 days'), datetime('now', '-24 days')),
    (3, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1733926500i/853510.jpg', 'Murder on the Orient Express', 'Agatha Christie', 'A classic murder mystery aboard a luxury train.', NULL, NULL, datetime('now', '-23 days'), datetime('now', '-23 days')),
    (4, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg', '1984', 'George Orwell', 'A dystopian social science fiction novel.', NULL, NULL, datetime('now', '-22 days'), datetime('now', '-22 days')),
    (5, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1417900846i/29579.jpg', 'Foundation', 'Isaac Asimov', 'The first book in the Foundation series.', 'Foundation', '1', datetime('now', '-21 days'), datetime('now', '-21 days')),
    (6, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1654215925i/61215351.jpg', 'The Fellowship of the Ring', 'J.R.R. Tolkien', 'The first part of the Lord of the Rings.', 'The Lord of the Rings', '1', datetime('now', '-20 days'), datetime('now', '-20 days')),
    (7, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1562726234i/13496.jpg', 'A Game of Thrones', 'George R.R. Martin', 'The first novel in A Song of Ice and Fire series.', 'A Song of Ice and Fire', '1', datetime('now', '-19 days'), datetime('now', '-19 days')),
    (8, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1598823299i/42844155.jpg', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'A young wizard begins his magical education.', 'Harry Potter', '1', datetime('now', '-18 days'), datetime('now', '-18 days')),
    (9, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1612238791i/56916837.jpg', 'To Kill a Mockingbird', 'Harper Lee', 'A gripping tale of racial injustice in the American South.', NULL, NULL, datetime('now', '-17 days'), datetime('now', '-17 days')),
    (10, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1681804503i/129915654.jpg', 'Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners.', NULL, NULL, datetime('now', '-16 days'), datetime('now', '-16 days')),

    -- Books without cover images (READ by Test user)
    (11, 1, NULL, 'The Great Gatsby', 'F. Scott Fitzgerald', 'A critique of the American Dream set in the Jazz Age.', NULL, NULL, datetime('now', '-15 days'), datetime('now', '-15 days')),
    (12, 1, NULL, 'Brave New World', 'Aldous Huxley', 'A dystopian novel about a futuristic World State.', NULL, NULL, datetime('now', '-14 days'), datetime('now', '-14 days')),
    (13, 1, NULL, 'The Catcher in the Rye', 'J.D. Salinger', 'A story of teenage rebellion and angst.', NULL, NULL, datetime('now', '-13 days'), datetime('now', '-13 days')),
    (14, 1, NULL, 'Fahrenheit 451', 'Ray Bradbury', 'A dystopian novel about book burning.', NULL, NULL, datetime('now', '-12 days'), datetime('now', '-12 days')),
    (15, 1, NULL, 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 'A comedic science fiction series.', 'Hitchhiker''s Guide', '1', datetime('now', '-11 days'), datetime('now', '-11 days')),

    -- Books with cover images (READING by Test user)
    (16, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1703329310i/23692271.jpg', 'Sapiens', 'Yuval Noah Harari', 'A brief history of humankind.', NULL, NULL, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (17, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1704917687i/186074.jpg', 'The Name of the Wind', 'Patrick Rothfuss', 'The story of Kvothe, a legendary figure.', 'The Kingkiller Chronicle', '1', datetime('now', '-9 days'), datetime('now', '-9 days')),
    (18, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1617768316i/68428.jpg', 'Mistborn: The Final Empire', 'Brandon Sanderson', 'A heist story in a fantasy world.', 'Mistborn', '1', datetime('now', '-8 days'), datetime('now', '-8 days')),

    -- Books without cover images (READING by Test user)
    (19, 1, NULL, 'The Silmarillion', 'J.R.R. Tolkien', 'The mythology and history of Middle-earth.', NULL, NULL, datetime('now', '-7 days'), datetime('now', '-7 days')),
    (20, 1, NULL, 'Neuromancer', 'William Gibson', 'A groundbreaking cyberpunk novel.', 'Sprawl', '1', datetime('now', '-6 days'), datetime('now', '-6 days')),

    -- Books with cover images (UNREAD by Test user)
    (21, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1577043824i/44492285.jpg', 'Dune Messiah', 'Frank Herbert', 'The second book in the Dune Chronicles.', 'Dune Chronicles', '2', datetime('now', '-5 days'), datetime('now', '-5 days')),
    (22, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1654216149i/61215372.jpg', 'The Two Towers', 'J.R.R. Tolkien', 'The second part of the Lord of the Rings.', 'The Lord of the Rings', '2', datetime('now', '-4 days'), datetime('now', '-4 days')),
    (23, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1474169725i/15881.jpg', 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 'Harry''s second year at Hogwarts.', 'Harry Potter', '2', datetime('now', '-3 days'), datetime('now', '-3 days')),
    (24, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1567840212i/10572.jpg', 'A Clash of Kings', 'George R.R. Martin', 'The second novel in A Song of Ice and Fire.', 'A Song of Ice and Fire', '2', datetime('now', '-2 days'), datetime('now', '-2 days')),
    (25, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1659905828i/7235533.jpg', 'The Way of Kings', 'Brandon Sanderson', 'The first book in the Stormlight Archive.', 'The Stormlight Archive', '1', datetime('now', '-1 day'), datetime('now', '-1 day')),

    -- Books without cover images (UNREAD by Test user)
    (26, 1, NULL, 'Children of Dune', 'Frank Herbert', 'The third book in the Dune Chronicles.', 'Dune Chronicles', '3', datetime('now', '-180 days'), datetime('now', '-180 days')),
    (27, 1, NULL, 'The Stand', 'Stephen King', 'A post-apocalyptic horror/fantasy novel.', NULL, NULL, datetime('now', '-179 days'), datetime('now', '-179 days')),
    (28, 1, NULL, 'It', 'Stephen King', 'A horror novel about a shape-shifting entity.', NULL, NULL, datetime('now', '-178 days'), datetime('now', '-178 days')),
    (29, 1, NULL, 'The Shining', 'Stephen King', 'A horror novel about a haunted hotel.', NULL, NULL, datetime('now', '-177 days'), datetime('now', '-177 days')),
    (30, 1, NULL, 'Ender''s Game', 'Orson Scott Card', 'A military science fiction novel.', 'Ender''s Saga', '1', datetime('now', '-176 days'), datetime('now', '-176 days')),

    -- Books with cover images (TBR by Test user)
    (31, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1372677697i/17910054.jpg', 'The Sixth Extinction', 'Elizabeth Kolbert', 'An account of the ongoing sixth mass extinction.', NULL, NULL, datetime('now', '-175 days'), datetime('now', '-175 days')),
    (32, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg', 'Educated', 'Tara Westover', 'A memoir about a woman who grows up in a strict family.', NULL, NULL, datetime('now', '-174 days'), datetime('now', '-174 days')),
    (33, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1528206996i/38746485.jpg', 'Becoming', 'Michelle Obama', 'The memoir of the former First Lady.', NULL, NULL, datetime('now', '-173 days'), datetime('now', '-173 days')),
    (34, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1317793965i/11468377.jpg', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'A book about the two systems of thinking.', NULL, NULL, datetime('now', '-172 days'), datetime('now', '-172 days')),
    (35, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg', 'A Brief History of Time', 'Stephen Hawking', 'A landmark volume in science writing.', NULL, NULL, datetime('now', '-171 days'), datetime('now', '-171 days')),

    -- Books without cover images (TBR by Test user)
    (36, 1, NULL, 'The Gene', 'Siddhartha Mukherjee', 'An intimate history of genetics.', NULL, NULL, datetime('now', '-170 days'), datetime('now', '-170 days')),
    (37, 1, NULL, 'Guns, Germs, and Steel', 'Jared Diamond', 'A book about human societies and fates.', NULL, NULL, datetime('now', '-169 days'), datetime('now', '-169 days')),
    (38, 1, NULL, 'Homo Deus', 'Yuval Noah Harari', 'A brief history of tomorrow.', NULL, NULL, datetime('now', '-168 days'), datetime('now', '-168 days')),
    (39, 1, NULL, '21 Lessons for the 21st Century', 'Yuval Noah Harari', 'Explores the present and immediate future.', NULL, NULL, datetime('now', '-167 days'), datetime('now', '-167 days')),
    (40, 1, NULL, 'The Power of Habit', 'Charles Duhigg', 'Why we do what we do in life and business.', NULL, NULL, datetime('now', '-166 days'), datetime('now', '-166 days')),

    -- Additional books with cover images (various authors, mix of statuses)
    (41, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1684638853i/2429135.jpg', 'The Girl with the Dragon Tattoo', 'Stieg Larsson', 'A gripping mystery thriller.', 'Millennium', '1', datetime('now', '-165 days'), datetime('now', '-165 days')),
    (42, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg', 'Gone Girl', 'Gillian Flynn', 'A psychological thriller about a missing wife.', NULL, NULL, datetime('now', '-164 days'), datetime('now', '-164 days')),
    (43, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1597798677i/55019161.jpg', 'The Da Vinci Code', 'Dan Brown', 'A mystery thriller following symbologist Robert Langdon.', 'Robert Langdon', '2', datetime('now', '-163 days'), datetime('now', '-163 days')),
    (44, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg', 'The Alchemist', 'Paulo Coelho', 'A philosophical novel about a shepherd''s journey.', NULL, NULL, datetime('now', '-162 days'), datetime('now', '-162 days')),
    (45, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1541428344i/17165596.jpg', 'The Kite Runner', 'Khaled Hosseini', 'A story of friendship and redemption in Afghanistan.', NULL, NULL, datetime('now', '-161 days'), datetime('now', '-161 days')),

    -- Additional books without cover images
    (46, 1, NULL, 'Life of Pi', 'Yann Martel', 'A tale of survival on the Pacific Ocean.', NULL, NULL, datetime('now', '-160 days'), datetime('now', '-160 days')),
    (47, 1, NULL, 'The Book Thief', 'Markus Zusak', 'A story narrated by Death during WWII.', NULL, NULL, datetime('now', '-159 days'), datetime('now', '-159 days')),
    (48, 1, NULL, 'The Road', 'Cormac McCarthy', 'A post-apocalyptic tale of a father and son.', NULL, NULL, datetime('now', '-158 days'), datetime('now', '-158 days')),
    (49, 1, NULL, 'Never Let Me Go', 'Kazuo Ishiguro', 'A dystopian science fiction novel.', NULL, NULL, datetime('now', '-157 days'), datetime('now', '-157 days')),
    (50, 1, NULL, 'The Remains of the Day', 'Kazuo Ishiguro', 'A story of an English butler reflecting on his life.', NULL, NULL, datetime('now', '-156 days'), datetime('now', '-156 days')),

    -- Books owned by other users
    (51, 2, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1562690475i/1934.jpg', 'Little Women', 'Louisa May Alcott', 'The story of the four March sisters.', NULL, NULL, datetime('now', '-155 days'), datetime('now', '-155 days')),
    (52, 2, NULL, 'Jane Eyre', 'Charlotte Brontë', 'A bildungsroman following the experiences of Jane.', NULL, NULL, datetime('now', '-154 days'), datetime('now', '-154 days')),
    (53, 3, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1327940656i/153747.jpg', 'Moby-Dick', 'Herman Melville', 'The narrative of Captain Ahab''s obsessive quest.', NULL, NULL, datetime('now', '-153 days'), datetime('now', '-153 days')),
    (54, 3, NULL, 'War and Peace', 'Leo Tolstoy', 'A literary work about the Napoleonic era.', NULL, NULL, datetime('now', '-152 days'), datetime('now', '-152 days')),
    (55, 1, 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg', 'Crime and Punishment', 'Fyodor Dostoevsky', 'A psychological thriller about morality.', NULL, NULL, datetime('now', '-151 days'), datetime('now', '-151 days'));

-- Associate books with genres
INSERT INTO book_genres (book_id, genre_id, created_at, updated_at) VALUES
    -- Science Fiction
    (1, 1, datetime('now', '-25 days'), datetime('now', '-25 days')),
    (4, 1, datetime('now', '-22 days'), datetime('now', '-22 days')),
    (5, 1, datetime('now', '-21 days'), datetime('now', '-21 days')),
    (12, 1, datetime('now', '-14 days'), datetime('now', '-14 days')),
    (14, 1, datetime('now', '-12 days'), datetime('now', '-12 days')),
    (15, 1, datetime('now', '-11 days'), datetime('now', '-11 days')),
    (20, 1, datetime('now', '-6 days'), datetime('now', '-6 days')),
    (21, 1, datetime('now', '-5 days'), datetime('now', '-5 days')),
    (26, 1, datetime('now', '-180 days'), datetime('now', '-180 days')),
    (30, 1, datetime('now', '-176 days'), datetime('now', '-176 days')),
    (49, 1, datetime('now', '-157 days'), datetime('now', '-157 days')),

    -- Fantasy
    (2, 2, datetime('now', '-24 days'), datetime('now', '-24 days')),
    (6, 2, datetime('now', '-20 days'), datetime('now', '-20 days')),
    (7, 2, datetime('now', '-19 days'), datetime('now', '-19 days')),
    (8, 2, datetime('now', '-18 days'), datetime('now', '-18 days')),
    (17, 2, datetime('now', '-9 days'), datetime('now', '-9 days')),
    (18, 2, datetime('now', '-8 days'), datetime('now', '-8 days')),
    (19, 2, datetime('now', '-7 days'), datetime('now', '-7 days')),
    (22, 2, datetime('now', '-4 days'), datetime('now', '-4 days')),
    (23, 2, datetime('now', '-3 days'), datetime('now', '-3 days')),
    (24, 2, datetime('now', '-2 days'), datetime('now', '-2 days')),
    (25, 2, datetime('now', '-1 day'), datetime('now', '-1 day')),

    -- Mystery/Thriller
    (3, 3, datetime('now', '-23 days'), datetime('now', '-23 days')),
    (41, 3, datetime('now', '-165 days'), datetime('now', '-165 days')),
    (42, 3, datetime('now', '-164 days'), datetime('now', '-164 days')),
    (43, 3, datetime('now', '-163 days'), datetime('now', '-163 days')),
    (41, 7, datetime('now', '-165 days'), datetime('now', '-165 days')),
    (42, 7, datetime('now', '-164 days'), datetime('now', '-164 days')),

    -- Non-Fiction
    (16, 4, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (31, 4, datetime('now', '-175 days'), datetime('now', '-175 days')),
    (34, 4, datetime('now', '-172 days'), datetime('now', '-172 days')),
    (35, 4, datetime('now', '-171 days'), datetime('now', '-171 days')),
    (36, 4, datetime('now', '-170 days'), datetime('now', '-170 days')),
    (37, 4, datetime('now', '-169 days'), datetime('now', '-169 days')),
    (38, 4, datetime('now', '-168 days'), datetime('now', '-168 days')),
    (39, 4, datetime('now', '-167 days'), datetime('now', '-167 days')),
    (40, 4, datetime('now', '-166 days'), datetime('now', '-166 days')),

    -- Biography/Memoir
    (32, 5, datetime('now', '-174 days'), datetime('now', '-174 days')),
    (33, 5, datetime('now', '-173 days'), datetime('now', '-173 days')),

    -- Historical Fiction
    (9, 6, datetime('now', '-17 days'), datetime('now', '-17 days')),
    (45, 6, datetime('now', '-161 days'), datetime('now', '-161 days')),
    (47, 6, datetime('now', '-159 days'), datetime('now', '-159 days')),

    -- Romance/Classic Romance
    (10, 8, datetime('now', '-16 days'), datetime('now', '-16 days')),
    (11, 6, datetime('now', '-15 days'), datetime('now', '-15 days')),
    (51, 8, datetime('now', '-155 days'), datetime('now', '-155 days')),
    (52, 8, datetime('now', '-154 days'), datetime('now', '-154 days')),

    -- Horror
    (27, 9, datetime('now', '-179 days'), datetime('now', '-179 days')),
    (28, 9, datetime('now', '-178 days'), datetime('now', '-178 days')),
    (29, 9, datetime('now', '-177 days'), datetime('now', '-177 days')),

    -- Philosophy/Classic Literature
    (44, 10, datetime('now', '-162 days'), datetime('now', '-162 days')),
    (55, 10, datetime('now', '-151 days'), datetime('now', '-151 days')),
    (13, 6, datetime('now', '-13 days'), datetime('now', '-13 days')),
    (46, 6, datetime('now', '-160 days'), datetime('now', '-160 days')),
    (48, 6, datetime('now', '-158 days'), datetime('now', '-158 days')),
    (50, 6, datetime('now', '-156 days'), datetime('now', '-156 days')),
    (53, 6, datetime('now', '-153 days'), datetime('now', '-153 days')),
    (54, 6, datetime('now', '-152 days'), datetime('now', '-152 days'));

-- Associate books with tags
INSERT INTO book_tags (book_id, tag_id, created_at, updated_at) VALUES
    -- Favorites
    (1, 1, datetime('now', '-25 days'), datetime('now', '-25 days')),
    (2, 1, datetime('now', '-24 days'), datetime('now', '-24 days')),
    (6, 1, datetime('now', '-20 days'), datetime('now', '-20 days')),
    (8, 1, datetime('now', '-18 days'), datetime('now', '-18 days')),
    (9, 1, datetime('now', '-17 days'), datetime('now', '-17 days')),

    -- Classics
    (1, 3, datetime('now', '-25 days'), datetime('now', '-25 days')),
    (2, 3, datetime('now', '-24 days'), datetime('now', '-24 days')),
    (3, 3, datetime('now', '-23 days'), datetime('now', '-23 days')),
    (4, 3, datetime('now', '-22 days'), datetime('now', '-22 days')),
    (9, 3, datetime('now', '-17 days'), datetime('now', '-17 days')),
    (10, 3, datetime('now', '-16 days'), datetime('now', '-16 days')),
    (11, 3, datetime('now', '-15 days'), datetime('now', '-15 days')),
    (13, 3, datetime('now', '-13 days'), datetime('now', '-13 days')),
    (53, 3, datetime('now', '-153 days'), datetime('now', '-153 days')),
    (54, 3, datetime('now', '-152 days'), datetime('now', '-152 days')),
    (55, 3, datetime('now', '-151 days'), datetime('now', '-151 days')),

    -- Award Winners
    (1, 4, datetime('now', '-25 days'), datetime('now', '-25 days')),
    (9, 4, datetime('now', '-17 days'), datetime('now', '-17 days')),
    (16, 4, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (31, 4, datetime('now', '-175 days'), datetime('now', '-175 days')),
    (44, 4, datetime('now', '-162 days'), datetime('now', '-162 days')),
    (46, 4, datetime('now', '-160 days'), datetime('now', '-160 days')),
    (49, 4, datetime('now', '-157 days'), datetime('now', '-157 days')),

    -- Page Turners
    (7, 5, datetime('now', '-19 days'), datetime('now', '-19 days')),
    (8, 5, datetime('now', '-18 days'), datetime('now', '-18 days')),
    (41, 5, datetime('now', '-165 days'), datetime('now', '-165 days')),
    (42, 5, datetime('now', '-164 days'), datetime('now', '-164 days')),
    (43, 5, datetime('now', '-163 days'), datetime('now', '-163 days')),

    -- Thought Provoking
    (4, 6, datetime('now', '-22 days'), datetime('now', '-22 days')),
    (12, 6, datetime('now', '-14 days'), datetime('now', '-14 days')),
    (14, 6, datetime('now', '-12 days'), datetime('now', '-12 days')),
    (16, 6, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (34, 6, datetime('now', '-172 days'), datetime('now', '-172 days')),
    (38, 6, datetime('now', '-168 days'), datetime('now', '-168 days')),
    (48, 6, datetime('now', '-158 days'), datetime('now', '-158 days')),
    (55, 6, datetime('now', '-151 days'), datetime('now', '-151 days')),

    -- To Reread
    (2, 2, datetime('now', '-24 days'), datetime('now', '-24 days')),
    (6, 2, datetime('now', '-20 days'), datetime('now', '-20 days')),
    (9, 2, datetime('now', '-17 days'), datetime('now', '-17 days'));

-- Insert ratings (Test user has rated books they've read)
INSERT INTO ratings (user_id, book_id, rating, created_at, updated_at) VALUES
    -- Books rated by Test user
    (1, 1, 5.0, datetime('now', '-20 days'), datetime('now', '-20 days')),
    (1, 2, 4.5, datetime('now', '-19 days'), datetime('now', '-19 days')),
    (1, 3, 4.0, datetime('now', '-18 days'), datetime('now', '-18 days')),
    (1, 4, 4.5, datetime('now', '-17 days'), datetime('now', '-17 days')),
    (1, 5, 4.5, datetime('now', '-16 days'), datetime('now', '-16 days')),
    (1, 6, 5.0, datetime('now', '-15 days'), datetime('now', '-15 days')),
    (1, 7, 4.0, datetime('now', '-14 days'), datetime('now', '-14 days')),
    (1, 8, 4.5, datetime('now', '-13 days'), datetime('now', '-13 days')),
    (1, 9, 5.0, datetime('now', '-12 days'), datetime('now', '-12 days')),
    (1, 10, 4.0, datetime('now', '-11 days'), datetime('now', '-11 days')),
    (1, 11, 4.0, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (1, 12, 4.5, datetime('now', '-9 days'), datetime('now', '-9 days')),
    (1, 13, 3.5, datetime('now', '-8 days'), datetime('now', '-8 days')),
    (1, 14, 5.0, datetime('now', '-7 days'), datetime('now', '-7 days')),
    (1, 15, 5.0, datetime('now', '-6 days'), datetime('now', '-6 days')),

    -- Alice and Bob ratings
    (2, 51, 4.5, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (3, 53, 4.0, datetime('now', '-8 days'), datetime('now', '-8 days'));

-- Insert reading statuses
-- Status IDs: 0=UNREAD, 1=READ, 2=READING, 3=TBR, 99=DNF
INSERT INTO reading_status (user_id, book_id, status_id, created_at, updated_at) VALUES
    -- Test user: READ (15 books)
    (1, 1, 1, datetime('now', '-20 days'), datetime('now', '-20 days')),
    (1, 2, 1, datetime('now', '-19 days'), datetime('now', '-19 days')),
    (1, 3, 1, datetime('now', '-18 days'), datetime('now', '-18 days')),
    (1, 4, 1, datetime('now', '-17 days'), datetime('now', '-17 days')),
    (1, 5, 1, datetime('now', '-16 days'), datetime('now', '-16 days')),
    (1, 6, 1, datetime('now', '-15 days'), datetime('now', '-15 days')),
    (1, 7, 1, datetime('now', '-14 days'), datetime('now', '-14 days')),
    (1, 8, 1, datetime('now', '-13 days'), datetime('now', '-13 days')),
    (1, 9, 1, datetime('now', '-12 days'), datetime('now', '-12 days')),
    (1, 10, 1, datetime('now', '-11 days'), datetime('now', '-11 days')),
    (1, 11, 1, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (1, 12, 1, datetime('now', '-9 days'), datetime('now', '-9 days')),
    (1, 13, 1, datetime('now', '-8 days'), datetime('now', '-8 days')),
    (1, 14, 1, datetime('now', '-7 days'), datetime('now', '-7 days')),
    (1, 15, 1, datetime('now', '-6 days'), datetime('now', '-6 days')),

    -- Test user: READING (5 books)
    (1, 16, 2, datetime('now', '-5 days'), datetime('now', '-5 days')),
    (1, 17, 2, datetime('now', '-4 days'), datetime('now', '-4 days')),
    (1, 18, 2, datetime('now', '-3 days'), datetime('now', '-3 days')),
    (1, 19, 2, datetime('now', '-2 days'), datetime('now', '-2 days')),
    (1, 20, 2, datetime('now', '-1 day'), datetime('now', '-1 day')),

    -- Test user: UNREAD (10 books - no explicit status needed, but adding some)
    (1, 21, 0, datetime('now', '-180 days'), datetime('now', '-180 days')),
    (1, 22, 0, datetime('now', '-179 days'), datetime('now', '-179 days')),
    (1, 23, 0, datetime('now', '-178 days'), datetime('now', '-178 days')),
    (1, 24, 0, datetime('now', '-177 days'), datetime('now', '-177 days')),
    (1, 25, 0, datetime('now', '-176 days'), datetime('now', '-176 days')),
    (1, 26, 0, datetime('now', '-175 days'), datetime('now', '-175 days')),
    (1, 27, 0, datetime('now', '-174 days'), datetime('now', '-174 days')),
    (1, 28, 0, datetime('now', '-173 days'), datetime('now', '-173 days')),
    (1, 29, 0, datetime('now', '-172 days'), datetime('now', '-172 days')),
    (1, 30, 0, datetime('now', '-171 days'), datetime('now', '-171 days')),

    -- Test user: TBR (10 books)
    (1, 31, 3, datetime('now', '-170 days'), datetime('now', '-170 days')),
    (1, 32, 3, datetime('now', '-169 days'), datetime('now', '-169 days')),
    (1, 33, 3, datetime('now', '-168 days'), datetime('now', '-168 days')),
    (1, 34, 3, datetime('now', '-167 days'), datetime('now', '-167 days')),
    (1, 35, 3, datetime('now', '-166 days'), datetime('now', '-166 days')),
    (1, 36, 3, datetime('now', '-165 days'), datetime('now', '-165 days')),
    (1, 37, 3, datetime('now', '-164 days'), datetime('now', '-164 days')),
    (1, 38, 3, datetime('now', '-163 days'), datetime('now', '-163 days')),
    (1, 39, 3, datetime('now', '-162 days'), datetime('now', '-162 days')),
    (1, 40, 3, datetime('now', '-161 days'), datetime('now', '-161 days')),

    -- Test user: Some books without explicit reading status (41-50 will be UNREAD by default)
    (1, 41, 0, datetime('now', '-160 days'), datetime('now', '-160 days')),
    (1, 42, 0, datetime('now', '-159 days'), datetime('now', '-159 days')),
    (1, 43, 0, datetime('now', '-158 days'), datetime('now', '-158 days')),
    (1, 44, 0, datetime('now', '-157 days'), datetime('now', '-157 days')),
    (1, 45, 0, datetime('now', '-156 days'), datetime('now', '-156 days')),

    -- Test user: DNF (a few books)
    (1, 46, 99, datetime('now', '-155 days'), datetime('now', '-155 days')),
    (1, 47, 99, datetime('now', '-154 days'), datetime('now', '-154 days')),

    -- Other users
    (2, 51, 2, datetime('now', '-10 days'), datetime('now', '-10 days')),
    (3, 53, 1, datetime('now', '-8 days'), datetime('now', '-8 days'));

-- Insert journal entries
INSERT INTO journal_entries (id, book_id, user_id, title, content, created_at, updated_at) VALUES
    (1, 1, 1, 'First thoughts on Dune', 'The world-building is incredible. Herbert creates such a rich universe with detailed politics, ecology, and culture. The spice melange is a fascinating concept.', datetime('now', '-20 days'), datetime('now', '-20 days')),
    (2, 2, 1, 'Journey through Middle-earth', 'Bilbo''s adventure is charming and full of wonder. The riddle game with Gollum was particularly memorable.', datetime('now', '-19 days'), datetime('now', '-19 days')),
    (3, 6, 1, 'The Fellowship begins', 'The world-building and depth of Middle-earth is unparalleled. Each character has their own voice and personality.', datetime('now', '-15 days'), datetime('now', '-15 days')),
    (4, 9, 1, 'Powerful narrative', 'Scout''s perspective on racial injustice is both innocent and profound. Atticus Finch is the moral compass we all need.', datetime('now', '-12 days'), datetime('now', '-12 days')),
    (5, 16, 1, 'Chapter 5 reflections', 'The agricultural revolution changed everything about human society. Harari''s perspective on history is eye-opening.', datetime('now', '-5 days'), datetime('now', '-5 days')),
    (6, 17, 1, 'Kvothe''s story', 'The framing narrative is intriguing. A legendary hero telling his own story - what will we learn about his fall from grace?', datetime('now', '-4 days'), datetime('now', '-4 days')),
    (7, 18, 1, 'Mistborn magic system', 'The Allomancy magic system is one of the most creative I''ve encountered. The rules are clear and the limitations make it interesting.', datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Associate journal entries with tags
INSERT INTO journal_entry_tags (journal_entry_id, tag_id, created_at, updated_at) VALUES
    (1, 1, datetime('now', '-20 days'), datetime('now', '-20 days')),
    (2, 1, datetime('now', '-19 days'), datetime('now', '-19 days')),
    (3, 1, datetime('now', '-15 days'), datetime('now', '-15 days')),
    (4, 6, datetime('now', '-12 days'), datetime('now', '-12 days')),
    (5, 6, datetime('now', '-5 days'), datetime('now', '-5 days')),
    (6, 5, datetime('now', '-4 days'), datetime('now', '-4 days')),
    (7, 6, datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Insert lists
INSERT INTO lists (id, user_id, type_id, name, created_at, updated_at) VALUES
    (1, 1, 1, 'All-Time Favorites', datetime('now', '-15 days'), datetime('now', '-15 days')),
    (2, 1, 2, 'To Read Next', datetime('now', '-14 days'), datetime('now', '-14 days')),
    (3, 1, 1, 'Fantasy Favorites', datetime('now', '-13 days'), datetime('now', '-13 days')),
    (4, 1, 1, 'Sci-Fi Classics', datetime('now', '-12 days'), datetime('now', '-12 days'));

-- Associate books with lists
INSERT INTO list_books (list_id, book_id, position, created_at) VALUES
    -- All-Time Favorites
    (1, 1, 1, datetime('now', '-15 days')),
    (1, 2, 2, datetime('now', '-15 days')),
    (1, 6, 3, datetime('now', '-15 days')),
    (1, 9, 4, datetime('now', '-15 days')),
    (1, 15, 5, datetime('now', '-15 days')),

    -- To Read Next
    (2, 21, 1, datetime('now', '-14 days')),
    (2, 25, 2, datetime('now', '-14 days')),
    (2, 31, 3, datetime('now', '-14 days')),

    -- Fantasy Favorites
    (3, 2, 1, datetime('now', '-13 days')),
    (3, 6, 2, datetime('now', '-13 days')),
    (3, 8, 3, datetime('now', '-13 days')),
    (3, 18, 4, datetime('now', '-13 days')),

    -- Sci-Fi Classics
    (4, 1, 1, datetime('now', '-12 days')),
    (4, 4, 2, datetime('now', '-12 days')),
    (4, 5, 3, datetime('now', '-12 days')),
    (4, 14, 4, datetime('now', '-12 days'));
