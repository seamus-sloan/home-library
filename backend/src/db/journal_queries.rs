use sqlx::{Pool, Sqlite};
use tracing::{debug, info, warn};

use crate::models::JournalEntry;

// Journal queries
pub async fn create_journal_entry(
    pool: &Pool<Sqlite>,
    mut journal: JournalEntry,
) -> Result<JournalEntry, sqlx::Error> {
    debug!(
        "Creating new journal entry for book ID: {} by user ID: {}",
        journal.book_id, journal.user_id
    );
    debug!(
        "Journal details - Title: '{}', Content: '{}'",
        journal.title, journal.content
    );

    let result = sqlx::query!(
        "INSERT INTO journal_entries (book_id, user_id, title, content) VALUES (?, ?, ?, ?)",
        journal.book_id,
        journal.user_id,
        journal.title,
        journal.content
    )
    .execute(pool)
    .await?;

    journal.id = result.last_insert_rowid();
    info!(
        "Successfully created journal entry '{}' with ID: {} for user: {}",
        journal.title, journal.id, journal.user_id
    );
    debug!(
        "New journal entry record: ID={}, Book ID={}, User ID={}, Title='{}'",
        journal.id, journal.book_id, journal.user_id, journal.title
    );

    Ok(journal)
}

pub async fn get_all_journals(pool: &Pool<Sqlite>) -> Result<Vec<JournalEntry>, sqlx::Error> {
    debug!("Querying database for all journal entries");

    let journals = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries"
    )
    .fetch_all(pool)
    .await?;

    info!("Retrieved {} journal entries from database", journals.len());
    if journals.is_empty() {
        debug!("No journal entries found in database");
    } else {
        debug!(
            "Journal titles: {:?}",
            journals.iter().map(|j| &j.title).collect::<Vec<_>>()
        );
    }

    Ok(journals)
}

pub async fn get_journal_by_id(
    pool: &Pool<Sqlite>,
    id: i64,
) -> Result<Option<JournalEntry>, sqlx::Error> {
    debug!("Querying database for journal entry with ID: {}", id);

    let journal = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries WHERE id = ?",
        id
    )
    .fetch_optional(pool)
    .await?;

    match journal.as_ref() {
        Some(j) => {
            info!("Found journal entry with ID {}: '{}'", id, j.title);
        }
        None => {
            warn!("No journal entry found with ID: {}", id);
        }
    }

    Ok(journal)
}

pub async fn get_journals_by_book_id(
    pool: &Pool<Sqlite>,
    book_id: i64,
) -> Result<Vec<JournalEntry>, sqlx::Error> {
    debug!(
        "Querying database for journal entries for book ID: {}",
        book_id
    );

    let journals = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries WHERE book_id = ?",
        book_id
    )
    .fetch_all(pool)
    .await?;

    info!(
        "Retrieved {} journal entries for book ID {}",
        journals.len(),
        book_id
    );
    if journals.is_empty() {
        debug!("No journal entries found for book ID: {}", book_id);
    } else {
        debug!(
            "Journal entries for book {}: {:?}",
            book_id,
            journals.iter().map(|j| &j.title).collect::<Vec<_>>()
        );
    }

    Ok(journals)
}
