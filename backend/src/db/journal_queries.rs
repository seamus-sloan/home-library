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

    let row = sqlx::query!(
        "INSERT INTO journal_entries (book_id, user_id, title, content) VALUES (?, ?, ?, ?) 
         RETURNING id, book_id, user_id, title, content, created_at, updated_at",
        journal.book_id,
        journal.user_id,
        journal.title,
        journal.content
    )
    .fetch_one(pool)
    .await?;

    let created_journal = JournalEntry {
        id: row.id.unwrap(),
        book_id: row.book_id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };

    // Update the associated book's updated_at timestamp
    sqlx::query!(
        "UPDATE books SET updated_at = datetime('now') WHERE id = ?",
        created_journal.book_id
    )
    .execute(pool)
    .await?;

    info!(
        "Successfully created journal entry '{}' with ID: {} for user: {}",
        created_journal.title, created_journal.id, created_journal.user_id
    );
    debug!(
        "New journal entry record: ID={}, Book ID={}, User ID={}, Title='{}'",
        created_journal.id, created_journal.book_id, created_journal.user_id, created_journal.title
    );
    debug!("Updated book ID {} timestamp", created_journal.book_id);

    Ok(created_journal)
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

pub async fn update_journal_entry(
    pool: &Pool<Sqlite>,
    journal_id: i64,
    title: Option<String>,
    content: Option<String>,
) -> Result<JournalEntry, sqlx::Error> {
    debug!("Updating journal entry with ID: {}", journal_id);

    // Get current journal data to fill in missing fields
    let current_journal = sqlx::query_as!(
        JournalEntry,
        "SELECT id, book_id, user_id, title, content, created_at, updated_at FROM journal_entries WHERE id = ?",
        journal_id
    )
    .fetch_one(pool)
    .await?;

    let final_title = title.unwrap_or(current_journal.title);
    let final_content = content.unwrap_or(current_journal.content);

    let row = sqlx::query!(
        "UPDATE journal_entries SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ? 
         RETURNING id, book_id, user_id, title, content, created_at, updated_at",
        final_title,
        final_content,
        journal_id
    )
    .fetch_one(pool)
    .await?;

    let updated_journal = JournalEntry {
        id: row.id,
        book_id: row.book_id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };

    info!(
        "Updated journal entry with ID {}: title='{}', content length={}",
        updated_journal.id,
        updated_journal.title,
        updated_journal.content.len()
    );
    Ok(updated_journal)
}
