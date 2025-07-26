use axum::{
    Router,
    routing::{delete, get, post, put},
};
use sqlx::{Pool, Sqlite};
use tracing::debug;

use crate::routes::*;

pub async fn app(pool: Pool<Sqlite>) -> Router {
    debug!("Creating router with routes");
    Router::new()
        .route("/users", get(get_users))
        .route("/users/select", post(select_user))
        .route("/books", post(create_book))
        .route("/books", get(get_books))
        .route("/books/{id}", get(get_single_book))
        .route("/books/{id}/journals", get(get_book_journals))
        .route("/books/{id}/journals", post(create_book_journal_entry))
        .route("/journals", get(get_journals))
        .route("/journals/{id}", get(get_single_journal))
        .route("/tags", get(get_tags))
        .route("/tags", post(create_tag))
        .route("/tags/{id}", get(get_tag_by_id))
        .route("/tags/{id}", put(update_tag))
        .route("/tags/{id}", delete(delete_tag))
        .with_state(pool)
}
