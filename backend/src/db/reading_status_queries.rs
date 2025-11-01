use sqlx::{Pool, Sqlite};
use tracing::{debug, info};

/// Upsert (insert or update) a reading status for a user and book
pub async fn upsert_status_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    book_id: i64,
    status_id: i64,
) -> Result<(), sqlx::Error> {
    debug!(
        "Upserting status for user_id: {}, book_id: {}, status_id: {}",
        user_id, book_id, status_id
    );

    sqlx::query!(
        "INSERT INTO reading_status (user_id, book_id, status_id)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, book_id) 
         DO UPDATE SET status_id = ?, updated_at = datetime('now')",
        user_id,
        book_id,
        status_id,
        status_id
    )
    .execute(pool)
    .await?;

    info!(
        "Successfully upserted status for user {} on book {}",
        user_id, book_id
    );
    Ok(())
}

/// Delete a reading status for a user and book
pub async fn delete_status_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    book_id: i64,
) -> Result<(), sqlx::Error> {
    debug!(
        "Deleting status for user_id: {}, book_id: {}",
        user_id, book_id
    );

    let result = sqlx::query!(
        "DELETE FROM reading_status WHERE user_id = ? AND book_id = ?",
        user_id,
        book_id
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        info!(
            "No status found to delete for user {} on book {}",
            user_id, book_id
        );
    } else {
        info!(
            "Successfully deleted status for user {} on book {}",
            user_id, book_id
        );
    }

    Ok(())
}

/// Get a reading status for a specific user and book
pub async fn get_status_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    book_id: i64,
) -> Result<Option<i64>, sqlx::Error> {
    debug!(
        "Getting status for user_id: {}, book_id: {}",
        user_id, book_id
    );

    let result = sqlx::query!(
        "SELECT status_id FROM reading_status WHERE user_id = ? AND book_id = ?",
        user_id,
        book_id
    )
    .fetch_optional(pool)
    .await?;

    match result {
        Some(row) => {
            info!(
                "Found status {} for user {} on book {}",
                row.status_id, user_id, book_id
            );
            Ok(Some(row.status_id))
        }
        None => {
            debug!("No status found for user {} on book {}", user_id, book_id);
            Ok(None)
        }
    }
}
