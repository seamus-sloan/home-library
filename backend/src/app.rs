use axum::{
    Router,
    routing::{get, post},
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
        .with_state(pool)
}
