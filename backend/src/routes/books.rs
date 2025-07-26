use axum::Json;
use axum::extract::{Path, State};
use axum::http::HeaderMap;
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{
    create_book_query, create_journal_entry, default_book_cover_query, delete_book_query,
    get_all_books_query, get_book_by_id_query, get_journals_by_book_id, update_book_query,
};
use crate::models::Book;
use crate::utils::extract_user_id_from_headers;

pub async fn get_books(State(pool): State<Pool<Sqlite>>) -> Result<Json<Vec<Book>>, StatusCode> {
    debug!("Fetching all books from database");

    match get_all_books_query(&pool).await {
        Ok(books) => {
            info!("Successfully retrieved {} books", books.len());
            debug!(
                "Books retrieved: {:?}",
                books.iter().map(|b| &b.title).collect::<Vec<_>>()
            );
            Ok(Json(books))
        }
        Err(e) => {
            error!("Failed to fetch books: {}", e);
            warn!("Returning empty book list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn create_book(
    State(pool): State<Pool<Sqlite>>,
    headers: HeaderMap,
    Json(mut book): Json<Book>,
) -> Result<Json<Book>, StatusCode> {
    if book.title.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    if book.author.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    // Set the user_id on the book
    book.user_id = user_id;

    info!("Creating new book: {} for user: {}", book.title, user_id);
    debug!(
        "Book details - Author: {}, Genre: {}, Rating: {:?}",
        book.author, book.genre, book.rating
    );

    match create_book_query(&pool, book).await {
        Ok(created_book) => {
            info!("Successfully created book with ID: {}", created_book.id);

            match &created_book.cover_image {
                Some(cover) if !cover.is_empty() => {
                    debug!("Cover image provided. Skipping default book cover.");
                }
                _ => {
                    debug!("No cover image provided for book");
                    if let Err(e) = default_book_cover_query(&pool, &created_book).await {
                        warn!("Failed to set default book cover: {}", e);
                        // Continue without failing the entire request
                    }
                }
            }

            // Even if we fail to fetch a cover via external api, we still create a book so we return success.
            Ok(Json(created_book))
        }
        Err(e) => {
            error!("Failed to create book: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_book_by_id(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<Json<Option<Book>>, StatusCode> {
    debug!("Fetching book with ID: {}", id);

    match get_book_by_id_query(&pool, id).await {
        Ok(Some(book)) => {
            info!("Found book with ID {}: '{}'", id, book.title);
            Ok(Json(Some(book)))
        }
        Ok(None) => {
            warn!("No book found with ID: {}", id);
            Ok(Json(None))
        }
        Err(e) => {
            error!("Failed to fetch book by ID {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn update_book(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
    headers: HeaderMap,
    Json(mut book): Json<Book>,
) -> Result<Json<Book>, StatusCode> {
    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    book.user_id = user_id;

    match update_book_query(&pool, id, book).await {
        Ok(updated_book) => {
            info!("Successfully updated book with ID: {}", updated_book.id);
            Ok(Json(updated_book))
        }
        Err(e) => {
            error!("Failed to update book: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn delete_book(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<StatusCode, StatusCode> {
    if id <= 0 {
        return Err(StatusCode::BAD_REQUEST);
    }

    info!("Deleting book with ID: {}", id);

    match delete_book_query(&pool, id).await {
        Ok(_) => {
            info!("Successfully deleted book with ID: {}", id);
            Ok(StatusCode::NO_CONTENT)
        }
        Err(e) => {
            error!("Failed to delete book: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_book_journals(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<Json<Vec<crate::models::JournalEntry>>, StatusCode> {
    debug!("Fetching journals for book with ID: {}", id);

    match get_journals_by_book_id(&pool, id).await {
        Ok(journals) => {
            info!("Found {} journals for book ID {}", journals.len(), id);
            Ok(Json(journals))
        }
        Err(e) => {
            error!("Failed to fetch journals for book ID {}: {}", id, e);
            warn!("Returning empty journal list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn create_book_journal_entry(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(book_id): axum::extract::Path<i64>,
    headers: HeaderMap,
    Json(mut journal): Json<crate::models::JournalEntry>,
) -> Result<Json<crate::models::JournalEntry>, StatusCode> {
    debug!("Creating journal for book ID: {}", book_id);

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    // Set the book_id from the path parameter and user_id from header
    journal.book_id = book_id;
    journal.user_id = user_id;

    info!(
        "Journal details - Title: '{}', Content: '{}', User ID: {}",
        journal.title, journal.content, user_id
    );

    match create_journal_entry(&pool, journal).await {
        Ok(created_journal) => {
            info!(
                "Successfully created journal with ID: {}",
                created_journal.id
            );
            Ok(Json(created_journal))
        }
        Err(e) => {
            error!("Failed to create journal: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
