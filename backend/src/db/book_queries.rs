use reqwest::Client;
use serde::Deserialize;
use sqlx::{Pool, Row, Sqlite};
use std::error::Error;
use tracing::{debug, info, warn};
use url::form_urlencoded;

use crate::models::books::BookGenre;
use crate::models::{Book, BookJournal, BookTag, BookWithDetails};

// Generic relationshpub async fn update_book_query(ment
async fn manage_book_relationships(
    pool: &Pool<Sqlite>,
    book_id: i64,
    item_ids: &[i64],
    table_name: &str,
    foreign_key_name: &str,
    item_type: &str,
) -> Result<(), sqlx::Error> {
    debug!(
        "Managing {} relationships for book {} with {} items",
        item_type,
        book_id,
        item_ids.len()
    );

    // Delete existing relationships
    let delete_query = format!("DELETE FROM {} WHERE book_id = ?", table_name);
    let result = sqlx::query(&delete_query)
        .bind(book_id)
        .execute(pool)
        .await?;

    info!(
        "Deleted {} existing {} relationships for book {}",
        result.rows_affected(),
        item_type,
        book_id
    );

    // Insert new relationships
    if !item_ids.is_empty() {
        let insert_query = format!(
            "INSERT INTO {} (book_id, {}) VALUES (?, ?)",
            table_name, foreign_key_name
        );

        for &item_id in item_ids {
            sqlx::query(&insert_query)
                .bind(book_id)
                .bind(item_id)
                .execute(pool)
                .await?;

            debug!(
                "Created {} relationship: book_id={}, {}={}",
                item_type, book_id, foreign_key_name, item_id
            );
        }
    }

    info!(
        "Successfully managed {} {} relationships for book {}",
        item_ids.len(),
        item_type,
        book_id
    );
    Ok(())
}

// Helper function to fetch book details (tags, genres, journals)
async fn fetch_book_details(
    pool: &Pool<Sqlite>,
    book: Book,
) -> Result<BookWithDetails, sqlx::Error> {
    let book_id = book.id;

    // Get tags for the book
    let tags = sqlx::query(
        "SELECT t.id, t.name, t.color 
         FROM tags t 
         INNER JOIN book_tags bt ON t.id = bt.tag_id 
         WHERE bt.book_id = ?
         ORDER BY t.name",
    )
    .bind(book_id)
    .fetch_all(pool)
    .await?;

    let book_tags: Vec<BookTag> = tags
        .into_iter()
        .map(|row| BookTag {
            id: row.get("id"),
            name: row.get("name"),
            color: row.get("color"),
        })
        .collect();

    // Get genres for the book
    let genres = sqlx::query(
        "SELECT g.id, g.name, g.color 
         FROM genres g 
         INNER JOIN book_genres bg ON g.id = bg.genre_id 
         WHERE bg.book_id = ?
         ORDER BY g.name",
    )
    .bind(book_id)
    .fetch_all(pool)
    .await?;

    let book_genres: Vec<BookGenre> = genres
        .into_iter()
        .map(|row| BookGenre {
            id: row.get("id"),
            name: row.get("name"),
            color: row.get("color"),
        })
        .collect();

    // Get journals for the book with user information
    let journals = sqlx::query(
        "SELECT je.id, je.title, je.content, je.created_at, u.id as user_id, u.name as user_name, u.color
         FROM journal_entries je
         INNER JOIN users u ON je.user_id = u.id
         WHERE je.book_id = ?
         ORDER BY je.created_at DESC",
    )
    .bind(book_id)
    .fetch_all(pool)
    .await?;

    let book_journals: Vec<BookJournal> = journals
        .into_iter()
        .map(|row| BookJournal {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
            created_at: row.get("created_at"),
            user: crate::models::books::JournalUser {
                id: row.get("user_id"),
                name: row.get("user_name"),
                color: row.get("color"),
            },
        })
        .collect();

    Ok(BookWithDetails {
        id: book.id,
        user_id: book.user_id,
        cover_image: book.cover_image,
        title: book.title,
        author: book.author,
        rating: book.rating,
        created_at: book.created_at,
        updated_at: book.updated_at,
        tags: book_tags,
        genres: book_genres,
        journals: book_journals,
    })
}

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

pub async fn create_book_query(pool: &Pool<Sqlite>, mut book: Book) -> Result<Book, sqlx::Error> {
    debug!(
        "Attempting to create book: '{}' for user: {}",
        book.title, book.user_id
    );
    debug!(
        "Book details - Author: '{}', Rating: {:?}",
        book.author, book.rating
    );

    let result = sqlx::query!(
        "INSERT INTO books (user_id, cover_image, title, author, rating) VALUES (?, ?, ?, ?, ?)",
        book.user_id,
        book.cover_image,
        book.title,
        book.author,
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

pub async fn create_book_tags(
    pool: &Pool<Sqlite>,
    book_id: i64,
    tag_ids: &[i64],
) -> Result<(), sqlx::Error> {
    manage_book_relationships(pool, book_id, tag_ids, "book_tags", "tag_id", "tag").await
}

pub async fn create_book_genres(
    pool: &Pool<Sqlite>,
    book_id: i64,
    genre_ids: &[i64],
) -> Result<(), sqlx::Error> {
    manage_book_relationships(pool, book_id, genre_ids, "book_genres", "genre_id", "genre").await
}

pub async fn update_book_tags(
    pool: &Pool<Sqlite>,
    book_id: i64,
    tag_ids: &[i64],
) -> Result<(), sqlx::Error> {
    manage_book_relationships(pool, book_id, tag_ids, "book_tags", "tag_id", "tag").await
}

pub async fn update_book_genres(
    pool: &Pool<Sqlite>,
    book_id: i64,
    genre_ids: &[i64],
) -> Result<(), sqlx::Error> {
    manage_book_relationships(pool, book_id, genre_ids, "book_genres", "genre_id", "genre").await
}

pub async fn update_book_query(
    pool: &Pool<Sqlite>,
    id: i64,
    book: Book,
) -> Result<Book, sqlx::Error> {
    let updated_book = sqlx::query_as!(
        Book,
        "UPDATE books SET cover_image = ?, title = ?, author = ?, rating = ? WHERE id = ? RETURNING id, user_id, cover_image, title, author, rating, created_at, updated_at",
        book.cover_image,
        book.title,
        book.author,
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

pub async fn get_book_details_query(
    pool: &Pool<Sqlite>,
    id: i64,
) -> Result<Option<BookWithDetails>, sqlx::Error> {
    debug!("Querying database for book with details for ID: {}", id);

    // First get the book
    let book = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, rating, created_at, updated_at FROM books WHERE id = ?",
        id
    )
    .fetch_optional(pool)
    .await?;

    let Some(book) = book else {
        warn!("No book found with ID: {}", id);
        return Ok(None);
    };

    info!("Found book with ID {}: '{}'", id, book.title);

    // Use helper function to fetch all details
    let book_with_details = fetch_book_details(pool, book).await?;
    Ok(Some(book_with_details))
}

pub async fn get_all_books_with_details_query(
    pool: &Pool<Sqlite>,
) -> Result<Vec<BookWithDetails>, sqlx::Error> {
    debug!("Querying database for all books with details");

    // First get all books
    let books = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, rating, created_at, updated_at FROM books"
    )
    .fetch_all(pool)
    .await?;

    info!("Found {} books", books.len());

    // Use helper function to fetch details for each book
    let mut books_with_details = Vec::new();
    for book in books {
        let book_with_details = fetch_book_details(pool, book).await?;
        books_with_details.push(book_with_details);
    }

    debug!(
        "Successfully built {} books with details",
        books_with_details.len()
    );
    Ok(books_with_details)
}

pub async fn search_books_with_details_query(
    pool: &Pool<Sqlite>,
    search_term: &str,
) -> Result<Vec<BookWithDetails>, sqlx::Error> {
    debug!(
        "Searching for books with details using term: {}",
        search_term
    );

    let search_pattern = format!("%{}%", search_term);

    // First get matching books
    let books = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, rating, created_at, updated_at 
         FROM books 
         WHERE title LIKE ? OR author LIKE ?
         ORDER BY updated_at DESC",
        search_pattern,
        search_pattern
    )
    .fetch_all(pool)
    .await?;

    info!(
        "Found {} books matching search term '{}'",
        books.len(),
        search_term
    );

    // Use helper function to fetch details for each book
    let mut books_with_details = Vec::new();
    for book in books {
        let book_with_details = fetch_book_details(pool, book).await?;
        books_with_details.push(book_with_details);
    }

    debug!(
        "Successfully built {} books with details from search",
        books_with_details.len()
    );
    Ok(books_with_details)
}
