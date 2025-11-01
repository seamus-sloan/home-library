use sqlx::{Pool, Sqlite};
use tracing::{debug, info};

#[derive(Debug)]
pub struct Rating {
    pub user_id: i64,
    pub book_id: i64,
    pub rating: f64,
}

// Create or update a rating for a book by a user
pub async fn upsert_rating_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    book_id: i64,
    rating: f64,
) -> Result<(), sqlx::Error> {
    debug!(
        "Upserting rating for book {} by user {} with rating {}",
        book_id, user_id, rating
    );

    sqlx::query!(
        "INSERT INTO ratings (user_id, book_id, rating) VALUES (?, ?, ?)
         ON CONFLICT(user_id, book_id) DO UPDATE SET rating = ?, updated_at = datetime('now')",
        user_id,
        book_id,
        rating,
        rating
    )
    .execute(pool)
    .await?;

    info!(
        "Successfully upserted rating for book {} by user {}",
        book_id, user_id
    );

    Ok(())
}

// Delete a rating for a book by a user
pub async fn delete_rating_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    book_id: i64,
) -> Result<(), sqlx::Error> {
    debug!("Deleting rating for book {} by user {}", book_id, user_id);

    sqlx::query!(
        "DELETE FROM ratings WHERE user_id = ? AND book_id = ?",
        user_id,
        book_id
    )
    .execute(pool)
    .await?;

    info!(
        "Successfully deleted rating for book {} by user {}",
        book_id, user_id
    );

    Ok(())
}

// Get a specific rating for a book by a user
pub async fn get_rating_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    book_id: i64,
) -> Result<Option<f64>, sqlx::Error> {
    debug!("Getting rating for book {} by user {}", book_id, user_id);

    let result = sqlx::query!(
        "SELECT rating FROM ratings WHERE user_id = ? AND book_id = ?",
        user_id,
        book_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|r| r.rating))
}
