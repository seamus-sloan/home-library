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
        .route("/books", get(get_books))
        .route("/books", post(create_book))
        .route("/books/{id}", get(get_book_details))
        .route("/books/{id}", put(update_book))
        .route("/books/{id}", delete(delete_book))
        .route("/books/{id}/journals", get(get_book_journals))
        .route("/books/{id}/journals", post(create_book_journal_entry))
        .route("/journals", get(get_journal_entries_query))
        .route("/journals/{id}", get(get_journal_entry_by_id_query))
        .route("/tags", get(get_tags))
        .route("/tags", post(create_tag))
        .route("/tags/{id}", get(get_tag_by_id))
        .route("/tags/{id}", put(update_tag))
        .route("/tags/{id}", delete(delete_tag))
        .with_state(pool)
}
