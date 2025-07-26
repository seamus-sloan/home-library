use reqwest::Client;
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use std::error::Error;
use tracing::{debug, info, warn};
use url::form_urlencoded;

use crate::models::Book;

#[derive(Deserialize)]
struct CoverResponse {
    url: String,
}

const DEFAULT_COVER_PATH: &str = "path/to/default/cover.jpg";
const BOOK_COVER_API_URL: &str = "https://bookcover.longitood.com/bookcover";

// Book queries
pub async fn default_book_cover_query(
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

pub async fn get_all_books_query(pool: &Pool<Sqlite>) -> Result<Vec<Book>, sqlx::Error> {
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
pub async fn create_book_query(pool: &Pool<Sqlite>, mut book: Book) -> Result<Book, sqlx::Error> {
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
pub async fn update_book_query(
    pool: &Pool<Sqlite>,
    id: i64,
    book: Book,
) -> Result<Book, sqlx::Error> {
    let updated_book = sqlx::query_as!(
        Book,
        "UPDATE books SET cover_image = ?, title = ?, author = ?, genre = ?, rating = ? WHERE id = ? RETURNING id, user_id, cover_image, title, author, genre, rating, created_at, updated_at",
        book.cover_image,
        book.title,
        book.author,
        book.genre,
        book.rating,
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(updated_book)
}
pub async fn delete_book_query(pool: &Pool<Sqlite>, id: i64) -> Result<(), sqlx::Error> {
    let result = sqlx::query!("DELETE FROM books WHERE id = ?", id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }

    Ok(())
}

pub async fn get_book_by_id_query(
    pool: &Pool<Sqlite>,
    id: i64,
) -> Result<Option<Book>, sqlx::Error> {
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
