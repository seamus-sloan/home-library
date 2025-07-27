use axum::Json;
use axum::extract::{State, Path};
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{get_all_journals, get_journal_by_id, update_journal_entry as db_update_journal_entry};
use crate::models::{JournalEntry, UpdateJournalRequest};

pub async fn get_journal_entries_query(
    State(pool): State<Pool<Sqlite>>,
) -> Result<Json<Vec<JournalEntry>>, StatusCode> {
    debug!("Fetching all journal entries from database");

    match get_all_journals(&pool).await {
        Ok(journals) => {
            info!("Successfully retrieved {} journal entries", journals.len());
            debug!(
                "Journal entries retrieved: {:?}",
                journals.iter().map(|j| &j.title).collect::<Vec<_>>()
            );
            Ok(Json(journals))
        }
        Err(e) => {
            error!("Failed to fetch journal entries: {}", e);
            warn!("Returning empty journal list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_journal_entry_by_id_query(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<Json<Option<JournalEntry>>, StatusCode> {
    debug!("Fetching journal entry with ID: {}", id);

    match get_journal_by_id(&pool, id).await {
        Ok(Some(journal)) => {
            info!("Found journal entry with ID {}: '{}'", id, journal.title);
            Ok(Json(Some(journal)))
        }
        Ok(None) => {
            warn!("No journal entry found with ID: {}", id);
            Ok(Json(None))
        }
        Err(e) => {
            error!("Failed to fetch journal entry by ID {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn update_journal_entry(
    State(pool): State<Pool<Sqlite>>,
    Path((book_id, journal_id)): Path<(i64, i64)>,
    Json(request): Json<UpdateJournalRequest>,
) -> Result<Json<JournalEntry>, StatusCode> {
    info!("Updating journal entry with ID: {} in book: {}", journal_id, book_id);

    match db_update_journal_entry(&pool, journal_id, request.title, request.content).await {
        Ok(updated_journal) => {
            info!("Successfully updated journal entry with ID: {}", updated_journal.id);
            Ok(Json(updated_journal))
        }
        Err(e) => {
            error!("Failed to update journal entry: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
