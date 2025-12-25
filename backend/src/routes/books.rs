use axum::Json;
use axum::extract::{Path, Query, State};
use axum::http::HeaderMap;
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::book_queries::{
    create_book_query, create_book_tags, default_book_cover_query, delete_book_query,
    get_all_books_with_details_query, get_book_details_query, search_books_with_details_query,
    update_book_genres, update_book_query, update_book_tags,
};
use crate::db::journal_queries::{create_journal_entry, get_journals_by_book_id};
use crate::db::rating_queries::{delete_rating_query, get_rating_query, upsert_rating_query};
use crate::db::reading_status_queries::{
    delete_status_query, get_status_query, upsert_status_query,
};
use crate::models::{Book, BookWithDetails, CreateBookRequest, UpdateBookRequest};
use crate::utils::extract_user_id_from_headers;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct BookQueryParams {
    search: Option<String>,
}

pub async fn get_books(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<BookQueryParams>,
    headers: HeaderMap,
) -> Result<Json<Vec<BookWithDetails>>, StatusCode> {
    debug!("Fetching books from database with params: {:?}", params);

    // Extract user_id from headers (optional for this endpoint)
    let current_user_id = extract_user_id_from_headers(&headers).ok();

    let books = match params.search {
        Some(search_term) => {
            debug!("Searching books with term: {}", search_term);
            search_books_with_details_query(&pool, &search_term, current_user_id).await
        }
        None => {
            debug!("Fetching all books");
            get_all_books_with_details_query(&pool, current_user_id).await
        }
    };

    match books {
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
    Json(request): Json<CreateBookRequest>,
) -> Result<Json<Book>, StatusCode> {
    if request.title.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    if request.author.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    // Create a Book from the request
    let book = Book {
        id: 0, // Will be set by the database
        user_id,
        cover_image: request.cover_image,
        title: request.title,
        author: request.author,
        series: request.series,
        created_at: None,
        updated_at: None,
    };

    info!("Creating new book: {} for user: {}", book.title, user_id);
    debug!("Book details - Author: {}", book.author);

    match create_book_query(&pool, book).await {
        Ok(created_book) => {
            info!("Successfully created book with ID: {}", created_book.id);

            // Handle tags if provided
            if let Some(tag_ids) = request.tags
                && !tag_ids.is_empty()
            {
                debug!(
                    "Creating book_tags relationships for {} tags",
                    tag_ids.len()
                );
                if let Err(e) = create_book_tags(&pool, created_book.id, &tag_ids).await {
                    error!("Failed to create book_tags relationships: {}", e);
                    // Continue without failing the entire request
                    warn!("Book created successfully but tags were not associated");
                }
            }

            // Handle genres if provided
            if let Some(genre_ids) = request.genres
                && !genre_ids.is_empty()
            {
                debug!(
                    "Creating book_genres relationships for {} genres",
                    genre_ids.len()
                );
                for genre_id in genre_ids {
                    if let Err(e) = crate::db::genre_queries::add_genre_to_book_query(
                        &pool,
                        created_book.id,
                        genre_id,
                    )
                    .await
                    {
                        error!(
                            "Failed to create book_genres relationship for genre_id {}: {}",
                            genre_id, e
                        );
                        // Continue without failing the entire request
                        warn!("Book created successfully but some genres were not associated");
                    }
                }
            }

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

pub async fn get_book_details(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
    headers: HeaderMap,
) -> Result<Json<BookWithDetails>, StatusCode> {
    debug!("Fetching book with details for ID: {}", id);

    // Extract user_id from headers (optional for this endpoint)
    let current_user_id = extract_user_id_from_headers(&headers).ok();

    match get_book_details_query(&pool, id, current_user_id).await {
        Ok(Some(book)) => {
            info!("Found book with ID {}: '{}'", id, book.title);
            Ok(Json(book))
        }
        Ok(None) => {
            warn!("No book found with ID: {}", id);
            Err(StatusCode::NOT_FOUND)
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
    Json(request): Json<UpdateBookRequest>,
) -> Result<Json<BookWithDetails>, StatusCode> {
    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    // First, get the current book to preserve fields that aren't being updated
    let current_book = match get_book_details_query(&pool, id, Some(user_id)).await {
        Ok(Some(book)) => book,
        Ok(None) => {
            warn!("No book found with ID: {}", id);
            return Err(StatusCode::NOT_FOUND);
        }
        Err(e) => {
            error!("Failed to fetch book by ID {}: {}", id, e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // Create updated book struct, preserving existing values for fields not provided
    let updated_book = Book {
        id,
        user_id,
        cover_image: request.cover_image.or(current_book.cover_image),
        title: request.title.unwrap_or(current_book.title),
        author: request.author.unwrap_or(current_book.author),
        series: request.series.or(current_book.series),
        created_at: current_book.created_at,
        updated_at: current_book.updated_at,
    };

    // Update the book in the database
    let updated_book = match update_book_query(&pool, id, updated_book).await {
        Ok(book) => book,
        Err(e) => {
            error!("Failed to update book: {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    info!("Successfully updated book with ID: {}", updated_book.id);

    // Handle tags if provided
    if let Some(tag_ids) = request.tags {
        debug!("Updating tags for book {} with {} tags", id, tag_ids.len());
        if let Err(e) = update_book_tags(&pool, id, &tag_ids).await {
            error!("Failed to update book tags: {}", e);
            // Continue without failing the entire request
            warn!("Book updated successfully but tags were not updated");
        }
    }

    // Handle genres if provided
    if let Some(genre_ids) = request.genres {
        debug!(
            "Updating genres for book {} with {} genres",
            id,
            genre_ids.len()
        );
        if let Err(e) = update_book_genres(&pool, id, &genre_ids).await {
            error!("Failed to update book genres: {}", e);
            // Continue without failing the entire request
            warn!("Book updated successfully but genres were not updated");
        }
    }

    // Return the updated book with details
    match get_book_details_query(&pool, id, Some(user_id)).await {
        Ok(Some(book_with_details)) => {
            info!(
                "Successfully retrieved updated book with details for ID: {}",
                id
            );
            Ok(Json(book_with_details))
        }
        Ok(None) => {
            error!("Book disappeared after update - this should not happen");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
        Err(e) => {
            error!("Failed to fetch updated book details: {}", e);
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
        Err(sqlx::Error::RowNotFound) => {
            warn!("Attempted to delete non-existent book with ID: {}", id);
            Err(StatusCode::NOT_FOUND)
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

    // First check if the book exists
    let book_exists = sqlx::query!("SELECT id FROM books WHERE id = ?", id)
        .fetch_optional(&pool)
        .await;

    match book_exists {
        Ok(Some(_)) => {
            // Book exists, now get its journals
            match get_journals_by_book_id(&pool, id).await {
                Ok(journals) => {
                    info!("Found {} journals for book ID {}", journals.len(), id);
                    Ok(Json(journals))
                }
                Err(e) => {
                    error!("Failed to fetch journals for book ID {}: {}", id, e);
                    Err(StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
        Ok(None) => {
            warn!("Book with ID {} not found when fetching journals", id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to check if book exists for ID {}: {}", id, e);
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

#[derive(serde::Deserialize, Debug)]
pub struct UpsertRatingRequest {
    rating: f64,
}

/// Upsert (create or update) a rating for a book by the current user
pub async fn upsert_rating(
    State(pool): State<Pool<Sqlite>>,
    Path(book_id): Path<i64>,
    headers: HeaderMap,
    Json(payload): Json<UpsertRatingRequest>,
) -> Result<StatusCode, StatusCode> {
    let user_id = match extract_user_id_from_headers(&headers) {
        Ok(id) => id,
        Err(status) => {
            warn!("Failed to extract user_id from headers");
            return Err(status);
        }
    };

    debug!(
        "Upserting rating for book {} by user {}: {}",
        book_id, user_id, payload.rating
    );

    // Validate rating is between 0 and 5
    if payload.rating < 0.0 || payload.rating > 5.0 {
        warn!("Invalid rating value: {}", payload.rating);
        return Err(StatusCode::BAD_REQUEST);
    }

    // Validate rating is in half-star increments (0, 0.5, 1.0, 1.5, etc.)
    if (payload.rating * 2.0).fract() != 0.0 {
        warn!("Rating must be in half-star increments: {}", payload.rating);
        return Err(StatusCode::BAD_REQUEST);
    }

    match upsert_rating_query(&pool, user_id, book_id, payload.rating).await {
        Ok(_) => {
            info!(
                "Successfully upserted rating for book {} by user {}",
                book_id, user_id
            );
            Ok(StatusCode::OK)
        }
        Err(e) => {
            error!("Failed to upsert rating: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Delete a rating for a book by the current user
pub async fn delete_rating(
    State(pool): State<Pool<Sqlite>>,
    Path(book_id): Path<i64>,
    headers: HeaderMap,
) -> Result<StatusCode, StatusCode> {
    let user_id = match extract_user_id_from_headers(&headers) {
        Ok(id) => id,
        Err(status) => {
            warn!("Failed to extract user_id from headers");
            return Err(status);
        }
    };

    debug!("Deleting rating for book {} by user {}", book_id, user_id);

    match delete_rating_query(&pool, user_id, book_id).await {
        Ok(_) => {
            info!(
                "Successfully deleted rating for book {} by user {}",
                book_id, user_id
            );
            Ok(StatusCode::NO_CONTENT)
        }
        Err(e) => {
            error!("Failed to delete rating: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Get the current user's rating for a book
pub async fn get_user_rating(
    State(pool): State<Pool<Sqlite>>,
    Path(book_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<Option<f64>>, StatusCode> {
    let user_id = match extract_user_id_from_headers(&headers) {
        Ok(id) => id,
        Err(status) => {
            warn!("Failed to extract user_id from headers");
            return Err(status);
        }
    };

    debug!("Getting rating for book {} by user {}", book_id, user_id);

    match get_rating_query(&pool, user_id, book_id).await {
        Ok(rating) => {
            info!(
                "Successfully retrieved rating for book {} by user {}: {:?}",
                book_id, user_id, rating
            );
            Ok(Json(rating))
        }
        Err(e) => {
            error!("Failed to get rating: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Upsert (create or update) a reading status for a book by the current user
pub async fn upsert_status(
    State(pool): State<Pool<Sqlite>>,
    Path(book_id): Path<i64>,
    headers: HeaderMap,
    Json(payload): Json<crate::models::books::UpsertStatusRequest>,
) -> Result<StatusCode, StatusCode> {
    let user_id = match extract_user_id_from_headers(&headers) {
        Ok(id) => id,
        Err(status) => {
            warn!("Failed to extract user_id from headers");
            return Err(status);
        }
    };

    debug!(
        "Upserting status for book {} by user {}: status_id={}",
        book_id, user_id, payload.status_id
    );

    // Validate status_id is valid (0=UNREAD, 1=READ, 2=READING, 3=TBR, 99=DNF)
    if ![0, 1, 2, 3, 99].contains(&payload.status_id) {
        warn!("Invalid status_id value: {}", payload.status_id);
        return Err(StatusCode::BAD_REQUEST);
    }

    match upsert_status_query(&pool, user_id, book_id, payload.status_id).await {
        Ok(_) => {
            info!(
                "Successfully upserted status for book {} by user {}",
                book_id, user_id
            );
            Ok(StatusCode::OK)
        }
        Err(e) => {
            error!("Failed to upsert status: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Delete a reading status for a book by the current user
pub async fn delete_status(
    State(pool): State<Pool<Sqlite>>,
    Path(book_id): Path<i64>,
    headers: HeaderMap,
) -> Result<StatusCode, StatusCode> {
    let user_id = match extract_user_id_from_headers(&headers) {
        Ok(id) => id,
        Err(status) => {
            warn!("Failed to extract user_id from headers");
            return Err(status);
        }
    };

    debug!("Deleting status for book {} by user {}", book_id, user_id);

    match delete_status_query(&pool, user_id, book_id).await {
        Ok(_) => {
            info!(
                "Successfully deleted status for book {} by user {}",
                book_id, user_id
            );
            Ok(StatusCode::NO_CONTENT)
        }
        Err(e) => {
            error!("Failed to delete status: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Get the current user's reading status for a book
pub async fn get_user_status(
    State(pool): State<Pool<Sqlite>>,
    Path(book_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<Option<i64>>, StatusCode> {
    let user_id = match extract_user_id_from_headers(&headers) {
        Ok(id) => id,
        Err(status) => {
            warn!("Failed to extract user_id from headers");
            return Err(status);
        }
    };

    debug!("Getting status for book {} by user {}", book_id, user_id);

    match get_status_query(&pool, user_id, book_id).await {
        Ok(status) => {
            info!(
                "Successfully retrieved status for book {} by user {}: {:?}",
                book_id, user_id, status
            );
            Ok(Json(status))
        }
        Err(e) => {
            error!("Failed to get status: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
