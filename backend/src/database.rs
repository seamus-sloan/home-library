use reqwest::Client;
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use std::error::Error;
use tracing::{debug, info, warn};
use url::form_urlencoded;

// Import the structs from main.rs
use crate::{Book, JournalEntry, User};

#[derive(Deserialize)]
struct CoverResponse {
    url: String,
}

const DEFAULT_COVER_PATH: &str = "path/to/default/cover.jpg";
const DATABASE_FILE: &str = "development.db";
const BOOK_COVER_API_URL: &str = "https://bookcover.longitood.com/bookcover";

pub async fn init_db() -> Pool<Sqlite> {
    debug!("Initializing SQLite database connection");

    let opt = sqlx::sqlite::SqliteConnectOptions::new()
        .filename(DATABASE_FILE)
        .create_if_missing(true);

    debug!("Connecting to SQLite database: {}", DATABASE_FILE);
    let pool = sqlx::sqlite::SqlitePool::connect_with(opt).await.unwrap();
    info!("Successfully connected to SQLite database");

    debug!("Running database migrations");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");
    info!("Database migrations completed successfully");

    pool
}

pub async fn get_all_users(pool: &Pool<Sqlite>) -> Result<Vec<User>, sqlx::Error> {
    debug!("Querying database for all users");

    let users = sqlx::query_as!(
        User,
        "SELECT id, name, avatar_color, created_at, updated_at, last_login FROM users"
    )
    .fetch_all(pool)
    .await?;

    info!("Retrieved {} users from database", users.len());
    if users.is_empty() {
        debug!("No users found in database");
    } else {
        debug!(
            "User names: {:?}",
            users.iter().map(|u| &u.name).collect::<Vec<_>>()
        );
    }

    Ok(users)
}

pub async fn select_user(pool: &Pool<Sqlite>, user_id: i64) -> Result<User, sqlx::Error> {
    debug!("Querying database for user with ID: {}", user_id);

    // Update last_login and return the updated user in one query
    let user = sqlx::query_as!(
        User,
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ? 
         RETURNING id, name, avatar_color, created_at, updated_at, last_login",
        user_id
    )
    .fetch_one(pool)
    .await?;

    info!(
        "Selected user with ID {}: '{}' (last_login updated)",
        user.id, user.name
    );
    Ok(user)
}

// Database operations
pub async fn create_book(pool: &Pool<Sqlite>, mut book: Book) -> Result<Book, sqlx::Error> {
    debug!(
        "Attempting to create book: '{}' for user: {}",
        book.title, book.user_id
    );
    debug!(
        "Book details - Author: '{}', Genre: '{}', Rating: {:?}",
        book.author, book.genre, book.rating
    );

    let result = sqlx::query!(
        "INSERT INTO books (user_id, cover_image, title, author, genre, rating) VALUES (?, ?, ?, ?, ?, ?)",
        book.user_id,
        book.cover_image,
        book.title,
        book.author,
        book.genre,
        book.rating
    )
    .execute(pool)
    .await?;

    book.id = result.last_insert_rowid();
    info!(
        "Successfully created book '{}' with ID: {} for user: {}",
        book.title, book.id, book.user_id
    );
    debug!(
        "New book record: ID={}, User ID={}, Title='{}', Author='{}'",
        book.id, book.user_id, book.title, book.author
    );

    Ok(book)
}

pub async fn set_default_book_cover(
    pool: &Pool<Sqlite>,
    book: &Book,
) -> Result<String, Box<dyn Error>> {
    debug!("Fetching default cover for book: {}", book.title);

    // Create the fetch query based off the book title & author name
    let encoded_title = form_urlencoded::byte_serialize(book.title.as_bytes()).collect::<String>();
    let encoded_author =
        form_urlencoded::byte_serialize(book.author.as_bytes()).collect::<String>();
    let query = format!(
        "{}?book_title={}&author_name={}",
        BOOK_COVER_API_URL, encoded_title, encoded_author
    );

    debug!("Sending request to fetch default cover: {}", query);

    let client = Client::new();
    let response = match client.get(&query).send().await {
        Ok(res) => res,
        Err(e) => {
            debug!("Request failed: {}", e);
            return Ok(DEFAULT_COVER_PATH.to_string());
        }
    };

    if !response.status().is_success() {
        warn!(
            "Cover API returned status {}: {:?}",
            response.status(),
            response.text().await
        );
        return Ok(DEFAULT_COVER_PATH.to_string());
    }

    let body: CoverResponse = match response.json().await {
        Ok(data) => data,
        Err(e) => {
            debug!("Failed to parse JSON: {}", e);
            return Ok(DEFAULT_COVER_PATH.to_string());
        }
    };

    debug!("Received cover URL: {}", body.url);

    // Update the DB with the cover image
    sqlx::query!(
        "UPDATE books SET cover_image = ? WHERE id = ?",
        body.url,
        book.id
    )
    .execute(pool)
    .await?;

    Ok(body.url)
}

pub async fn get_all_books(pool: &Pool<Sqlite>) -> Result<Vec<Book>, sqlx::Error> {
    debug!("Querying database for all books");

    let books = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, genre, rating, created_at, updated_at FROM books"
    )
    .fetch_all(pool)
    .await?;

    info!("Retrieved {} books from database", books.len());
    if books.is_empty() {
        debug!("No books found in database");
    } else {
        debug!(
            "Book titles: {:?}",
            books.iter().map(|b| &b.title).collect::<Vec<_>>()
        );
    }

    Ok(books)
}

pub async fn get_book_by_id(pool: &Pool<Sqlite>, id: i64) -> Result<Option<Book>, sqlx::Error> {
    debug!("Querying database for book with ID: {}", id);

    let book = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, genre, rating, created_at, updated_at FROM books WHERE id = ?",
        id
    )
    .fetch_optional(pool)
    .await?;

    match &book {
        Some(b) => {
            info!("Found book with ID {}: '{}'", id, b.title);
            debug!(
                "Book details - Author: '{}', Genre: '{}'",
                b.author, b.genre
            );
        }
        None => {
            warn!("No book found with ID: {}", id);
        }
    }

    Ok(book)
}

pub async fn create_journal_entry(
    pool: &Pool<Sqlite>,
    mut journal: JournalEntry,
) -> Result<JournalEntry, sqlx::Error> {
    debug!(
        "Creating new journal entry for book ID: {} by user ID: {}",
        journal.book_id, journal.user_id
    );
    debug!(
        "Journal details - Title: '{}', Content: '{}'",
        journal.title, journal.content
    );

    let result = sqlx::query!(
        "INSERT INTO journal_entries (book_id, user_id, title, content) VALUES (?, ?, ?, ?)",
        journal.book_id,
        journal.user_id,
        journal.title,
        journal.content
    )
    .execute(pool)
    .await?;

    journal.id = result.last_insert_rowid();
    info!(
        "Successfully created journal entry '{}' with ID: {} for user: {}",
        journal.title, journal.id, journal.user_id
    );
    debug!(
        "New journal entry record: ID={}, Book ID={}, User ID={}, Title='{}'",
        journal.id, journal.book_id, journal.user_id, journal.title
    );

    Ok(journal)
}

pub async fn get_all_journals(pool: &Pool<Sqlite>) -> Result<Vec<JournalEntry>, sqlx::Error> {
    debug!("Querying database for all journal entries");

    let journals = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries"
    )
    .fetch_all(pool)
    .await?;

    info!("Retrieved {} journal entries from database", journals.len());
    if journals.is_empty() {
        debug!("No journal entries found in database");
    } else {
        debug!(
            "Journal titles: {:?}",
            journals.iter().map(|j| &j.title).collect::<Vec<_>>()
        );
    }

    Ok(journals)
}

pub async fn get_journal_by_id(
    pool: &Pool<Sqlite>,
    id: i64,
) -> Result<Option<JournalEntry>, sqlx::Error> {
    debug!("Querying database for journal entry with ID: {}", id);

    let journal = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries WHERE id = ?",
        id
    )
    .fetch_optional(pool)
    .await?;

    match &journal {
        Some(j) => {
            info!("Found journal entry with ID {}: '{}'", id, j.title);
        }
        None => {
            warn!("No journal entry found with ID: {}", id);
        }
    }

    Ok(journal)
}

pub async fn get_journals_by_book_id(
    pool: &Pool<Sqlite>,
    book_id: i64,
) -> Result<Vec<JournalEntry>, sqlx::Error> {
    debug!(
        "Querying database for journal entries for book ID: {}",
        book_id
    );

    let journals = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries WHERE book_id = ?",
        book_id
    )
    .fetch_all(pool)
    .await?;

    info!(
        "Retrieved {} journal entries for book ID {}",
        journals.len(),
        book_id
    );
    if journals.is_empty() {
        debug!("No journal entries found for book ID: {}", book_id);
    } else {
        debug!(
            "Journal entries for book {}: {:?}",
            book_id,
            journals.iter().map(|j| &j.title).collect::<Vec<_>>()
        );
    }

    Ok(journals)
}
