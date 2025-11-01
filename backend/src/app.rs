use axum::{
    Router,
    http::StatusCode,
    response::Json,
    routing::{delete, get, post, put},
};
use serde_derive::Serialize;
use sqlx::{Pool, Sqlite};
use tracing::debug;

use crate::routes::*;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    message: String,
}

async fn health_check() -> Result<Json<HealthResponse>, StatusCode> {
    Ok(Json(HealthResponse {
        status: "healthy".to_string(),
        message: "Home Library API is running".to_string(),
    }))
}

pub async fn app(pool: Pool<Sqlite>) -> Router {
    debug!("Creating router with routes");
    Router::new()
        .route("/health", get(health_check))
        .route("/users", get(get_users))
        .route("/users/select", post(select_user))
        .route("/users/{id}", put(update_user))
        .route("/books", get(get_books))
        .route("/books", post(create_book))
        .route("/books/{id}", get(get_book_details))
        .route("/books/{id}", put(update_book))
        .route("/books/{id}", delete(delete_book))
        .route("/books/{id}/journals", get(get_book_journals))
        .route("/books/{id}/journals", post(create_book_journal_entry))
        .route(
            "/books/{book_id}/journals/{journal_id}",
            put(update_journal_entry),
        )
        .route("/books/{id}/ratings", post(upsert_rating))
        .route("/books/{id}/ratings", get(get_user_rating))
        .route("/books/{id}/ratings", delete(delete_rating))
        .route("/books/{id}/status", post(upsert_status))
        .route("/books/{id}/status", get(get_user_status))
        .route("/books/{id}/status", delete(delete_status))
        .route("/journals", get(get_journal_entries_query))
        .route("/journals/{id}", get(get_journal_entry_by_id_query))
        .route("/tags", get(get_tags))
        .route("/tags", post(create_tag))
        .route("/tags/{id}", get(get_tag_by_id))
        .route("/tags/{id}", put(update_tag))
        .route("/tags/{id}", delete(delete_tag))
        .route("/genres", get(get_genres))
        .route("/genres", post(create_genre))
        .route("/genres/{id}", get(get_genre_by_id))
        .route("/genres/{id}", put(update_genre))
        .route("/genres/{id}", delete(delete_genre))
        .with_state(pool)
}
