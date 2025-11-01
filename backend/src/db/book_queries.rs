use reqwest::Client;
use serde::Deserialize;
use sqlx::{Pool, Row, Sqlite};
use std::collections::HashMap;
use std::error::Error;
use tracing::{debug, info, warn};
use url::form_urlencoded;

use crate::models::books::{BookGenre, BookRating};
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

// Helper function to batch load ratings for multiple books
async fn fetch_ratings_for_books(
    pool: &Pool<Sqlite>,
    book_ids: &[i64],
) -> Result<HashMap<i64, Vec<BookRating>>, sqlx::Error> {
    if book_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let placeholders = book_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
        "SELECT r.id, r.user_id, r.book_id, r.rating, r.created_at, r.updated_at, u.name as user_name, u.color as user_color
         FROM ratings r
         INNER JOIN users u ON r.user_id = u.id
         WHERE r.book_id IN ({})
         ORDER BY r.created_at DESC",
        placeholders
    );

    let mut query_builder = sqlx::query(&query);
    for &book_id in book_ids {
        query_builder = query_builder.bind(book_id);
    }

    let rows = query_builder.fetch_all(pool).await?;

    let mut ratings_map: HashMap<i64, Vec<BookRating>> = HashMap::new();
    for row in rows {
        let book_id: i64 = row.get("book_id");
        let rating = BookRating {
            id: row.get("id"),
            user_id: row.get("user_id"),
            book_id,
            rating: row.get("rating"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            user: crate::models::books::RatingUser {
                id: row.get("user_id"),
                name: row.get("user_name"),
                color: row.get("user_color"),
            },
        };
        ratings_map
            .entry(book_id)
            .or_insert_with(Vec::new)
            .push(rating);
    }

    Ok(ratings_map)
}

// Helper function to batch load statuses for multiple books
async fn fetch_statuses_for_books(
    pool: &Pool<Sqlite>,
    book_ids: &[i64],
) -> Result<HashMap<i64, Vec<crate::models::books::BookStatus>>, sqlx::Error> {
    if book_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let placeholders = book_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
        "SELECT rs.id, rs.user_id, rs.book_id, rs.status_id, rs.created_at, rs.updated_at, 
                s.name as status_name, u.name as user_name, u.color as user_color
         FROM reading_status rs
         INNER JOIN users u ON rs.user_id = u.id
         INNER JOIN status s ON rs.status_id = s.id
         WHERE rs.book_id IN ({})
         ORDER BY rs.created_at DESC",
        placeholders
    );

    let mut query_builder = sqlx::query(&query);
    for &book_id in book_ids {
        query_builder = query_builder.bind(book_id);
    }

    let rows = query_builder.fetch_all(pool).await?;

    let mut statuses_map: HashMap<i64, Vec<crate::models::books::BookStatus>> = HashMap::new();
    for row in rows {
        let book_id: i64 = row.get("book_id");
        let status = crate::models::books::BookStatus {
            id: row.get("id"),
            user_id: row.get("user_id"),
            book_id,
            status_id: row.get("status_id"),
            status_name: row.get("status_name"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            user: crate::models::books::StatusUser {
                id: row.get("user_id"),
                name: row.get("user_name"),
                color: row.get("user_color"),
            },
        };
        statuses_map
            .entry(book_id)
            .or_insert_with(Vec::new)
            .push(status);
    }

    Ok(statuses_map)
}

// Helper function to batch load current user statuses for multiple books
async fn fetch_current_user_statuses(
    pool: &Pool<Sqlite>,
    book_ids: &[i64],
    user_id: i64,
) -> Result<HashMap<i64, i64>, sqlx::Error> {
    if book_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let placeholders = book_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
        "SELECT book_id, status_id FROM reading_status WHERE user_id = ? AND book_id IN ({})",
        placeholders
    );

    let mut query_builder = sqlx::query(&query).bind(user_id);
    for &book_id in book_ids {
        query_builder = query_builder.bind(book_id);
    }

    let rows = query_builder.fetch_all(pool).await?;

    let mut status_map: HashMap<i64, i64> = HashMap::new();
    for row in rows {
        let book_id: i64 = row.get("book_id");
        let status_id: i64 = row.get("status_id");
        status_map.insert(book_id, status_id);
    }

    Ok(status_map)
}

// Helper function to fetch book details with optional pre-fetched ratings/statuses
async fn fetch_book_details(
    pool: &Pool<Sqlite>,
    book: Book,
    ratings: Vec<BookRating>,
    statuses: Vec<crate::models::books::BookStatus>,
    current_user_status: Option<i64>,
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

    // Ratings and statuses are now passed as parameters (pre-fetched in batch)

    Ok(BookWithDetails {
        id: book.id,
        user_id: book.user_id,
        cover_image: book.cover_image,
        title: book.title,
        author: book.author,
        series: book.series,
        created_at: book.created_at,
        updated_at: book.updated_at,
        tags: book_tags,
        genres: book_genres,
        journals: book_journals,
        ratings,
        statuses,
        current_user_status,
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

pub async fn create_book_query(pool: &Pool<Sqlite>, book: Book) -> Result<Book, sqlx::Error> {
    debug!(
        "Attempting to create book: '{}' for user: {}",
        book.title, book.user_id
    );
    debug!("Book details - Author: '{}'", book.author);

    let row = sqlx::query!(
        "INSERT INTO books (user_id, cover_image, title, author, series) VALUES (?, ?, ?, ?, ?) 
         RETURNING id, user_id, cover_image, title, author, series, created_at, updated_at",
        book.user_id,
        book.cover_image,
        book.title,
        book.author,
        book.series
    )
    .fetch_one(pool)
    .await?;

    let created_book = Book {
        id: row.id.unwrap(),
        user_id: row.user_id,
        cover_image: row.cover_image,
        title: row.title,
        author: row.author,
        series: row.series,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };

    info!(
        "Successfully created book '{}' with ID: {} for user: {}",
        created_book.title, created_book.id, created_book.user_id
    );
    debug!(
        "New book record: ID={}, User ID={}, Title='{}', Author='{}'",
        created_book.id, created_book.user_id, created_book.title, created_book.author
    );

    Ok(created_book)
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
        "UPDATE books SET cover_image = ?, title = ?, author = ?, series = ?, updated_at = datetime('now') WHERE id = ? RETURNING id, user_id, cover_image, title, author, series, created_at, updated_at",
        book.cover_image,
        book.title,
        book.author,
        book.series,
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(updated_book)
}
pub async fn delete_book_query(pool: &Pool<Sqlite>, id: i64) -> Result<(), sqlx::Error> {
    // Start a transaction to ensure all deletes succeed or fail together
    let mut tx = pool.begin().await?;

    // Delete associated book_tags first
    sqlx::query!("DELETE FROM book_tags WHERE book_id = ?", id)
        .execute(&mut *tx)
        .await?;

    // Delete associated book_genres
    sqlx::query!("DELETE FROM book_genres WHERE book_id = ?", id)
        .execute(&mut *tx)
        .await?;

    // Delete associated journal entries (these cascade due to foreign key constraint)
    sqlx::query!("DELETE FROM journal_entries WHERE book_id = ?", id)
        .execute(&mut *tx)
        .await?;

    // Finally delete the book itself
    let result = sqlx::query!("DELETE FROM books WHERE id = ?", id)
        .execute(&mut *tx)
        .await?;

    if result.rows_affected() == 0 {
        tx.rollback().await?;
        return Err(sqlx::Error::RowNotFound);
    }

    // Commit the transaction
    tx.commit().await?;

    Ok(())
}

pub async fn get_book_details_query(
    pool: &Pool<Sqlite>,
    id: i64,
    current_user_id: Option<i64>,
) -> Result<Option<BookWithDetails>, sqlx::Error> {
    debug!("Querying database for book with details for ID: {}", id);

    // First get the book
    let book = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, series, created_at, updated_at FROM books WHERE id = ?",
        id
    )
    .fetch_optional(pool)
    .await?;

    let Some(book) = book else {
        warn!("No book found with ID: {}", id);
        return Ok(None);
    };

    info!("Found book with ID {}: '{}'", id, book.title);

    // Fetch ratings and statuses for this book
    let book_ids = vec![id];
    let mut ratings_map = fetch_ratings_for_books(pool, &book_ids).await?;
    let mut statuses_map = fetch_statuses_for_books(pool, &book_ids).await?;

    let ratings = ratings_map.remove(&id).unwrap_or_default();
    let statuses = statuses_map.remove(&id).unwrap_or_default();

    // Get current user status if provided
    let current_user_status = if let Some(user_id) = current_user_id {
        let status_map = fetch_current_user_statuses(pool, &book_ids, user_id).await?;
        status_map.get(&id).copied()
    } else {
        None
    };

    // Use helper function to fetch all details
    let book_with_details =
        fetch_book_details(pool, book, ratings, statuses, current_user_status).await?;
    Ok(Some(book_with_details))
}

pub async fn get_all_books_with_details_query(
    pool: &Pool<Sqlite>,
    current_user_id: Option<i64>,
) -> Result<Vec<BookWithDetails>, sqlx::Error> {
    debug!("Querying database for all books with details");

    // First get all books
    let books = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, series, created_at, updated_at FROM books ORDER BY updated_at DESC"
    )
    .fetch_all(pool)
    .await?;

    info!("Found {} books", books.len());

    // Batch fetch ratings and statuses for all books
    let book_ids: Vec<i64> = books.iter().map(|b| b.id).collect();
    let mut ratings_map = fetch_ratings_for_books(pool, &book_ids).await?;
    let mut statuses_map = fetch_statuses_for_books(pool, &book_ids).await?;

    // Fetch current user statuses if user_id is provided
    let current_user_statuses = if let Some(user_id) = current_user_id {
        fetch_current_user_statuses(pool, &book_ids, user_id).await?
    } else {
        HashMap::new()
    };

    // Use helper function to fetch details for each book
    let mut books_with_details = Vec::new();
    for book in books {
        let book_id = book.id;
        let ratings = ratings_map.remove(&book_id).unwrap_or_default();
        let statuses = statuses_map.remove(&book_id).unwrap_or_default();
        let current_user_status = current_user_statuses.get(&book_id).copied();

        let book_with_details =
            fetch_book_details(pool, book, ratings, statuses, current_user_status).await?;
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
    current_user_id: Option<i64>,
) -> Result<Vec<BookWithDetails>, sqlx::Error> {
    debug!(
        "Searching for books with details using term: {}",
        search_term
    );

    let search_pattern = format!("%{}%", search_term);

    // First get matching books
    let books = sqlx::query_as!(
        Book,
        "SELECT id, user_id, cover_image, title, author, series, created_at, updated_at 
         FROM books 
         WHERE title LIKE ? OR author LIKE ? OR series LIKE ?
         ORDER BY updated_at DESC",
        search_pattern,
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

    // Batch fetch ratings and statuses for all books
    let book_ids: Vec<i64> = books.iter().map(|b| b.id).collect();
    let mut ratings_map = fetch_ratings_for_books(pool, &book_ids).await?;
    let mut statuses_map = fetch_statuses_for_books(pool, &book_ids).await?;

    // Fetch current user statuses if user_id is provided
    let current_user_statuses = if let Some(user_id) = current_user_id {
        fetch_current_user_statuses(pool, &book_ids, user_id).await?
    } else {
        HashMap::new()
    };

    // Use helper function to fetch details for each book
    let mut books_with_details = Vec::new();
    for book in books {
        let book_id = book.id;
        let ratings = ratings_map.remove(&book_id).unwrap_or_default();
        let statuses = statuses_map.remove(&book_id).unwrap_or_default();
        let current_user_status = current_user_statuses.get(&book_id).copied();

        let book_with_details =
            fetch_book_details(pool, book, ratings, statuses, current_user_status).await?;
        books_with_details.push(book_with_details);
    }

    debug!(
        "Successfully built {} books with details from search",
        books_with_details.len()
    );
    Ok(books_with_details)
}
