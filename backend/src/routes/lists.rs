use axum::Json;
use axum::extract::{Path, State};
use axum::http::HeaderMap;
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{
    create_list_query, delete_list_query, get_all_lists_query, get_list_by_id_query,
    update_list_query,
};
use crate::models::lists::{CreateListRequest, ListWithBooks, UpdateListRequest};
use crate::utils::extract_user_id_from_headers;

// GET /lists - Get all lists
pub async fn get_lists(
    State(pool): State<Pool<Sqlite>>,
) -> Result<Json<Vec<ListWithBooks>>, StatusCode> {
    debug!("Fetching all lists");

    match get_all_lists_query(&pool).await {
        Ok(lists) => {
            info!("Successfully fetched {} lists", lists.len());
            Ok(Json(lists))
        }
        Err(e) => {
            error!("Failed to fetch lists: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// GET /lists/:id - Get a single list by ID
pub async fn get_list(
    State(pool): State<Pool<Sqlite>>,
    Path(list_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<ListWithBooks>, StatusCode> {
    debug!("Fetching list with id: {}", list_id);

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    match get_list_by_id_query(&pool, list_id, user_id).await {
        Ok(Some(list)) => {
            info!("Successfully fetched list {}", list_id);
            Ok(Json(list))
        }
        Ok(None) => {
            warn!("No list found with id: {} for user: {}", list_id, user_id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to fetch list {}: {}", list_id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// POST /lists - Create a new list
pub async fn create_list(
    State(pool): State<Pool<Sqlite>>,
    headers: HeaderMap,
    Json(request): Json<CreateListRequest>,
) -> Result<Json<ListWithBooks>, StatusCode> {
    debug!("Creating new list");

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    info!(
        "Creating new list '{}' for user {} with {} books",
        request.name,
        user_id,
        request.books.len()
    );

    match create_list_query(&pool, user_id, request).await {
        Ok(list) => {
            info!("Successfully created list with id: {}", list.id);
            Ok(Json(list))
        }
        Err(e) => {
            error!("Failed to create list for user {}: {}", user_id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// PUT /lists/:id - Update an existing list
pub async fn update_list(
    State(pool): State<Pool<Sqlite>>,
    Path(list_id): Path<i64>,
    headers: HeaderMap,
    Json(request): Json<UpdateListRequest>,
) -> Result<Json<ListWithBooks>, StatusCode> {
    debug!("Updating list with id: {}", list_id);

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    info!("Updating list {} for user {}", list_id, user_id);

    match update_list_query(&pool, list_id, user_id, request).await {
        Ok(list) => {
            info!("Successfully updated list {}", list_id);
            Ok(Json(list))
        }
        Err(sqlx::Error::RowNotFound) => {
            warn!("No list found with id: {} for user: {}", list_id, user_id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to update list {}: {}", list_id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// DELETE /lists/:id - Delete a list
pub async fn delete_list(
    State(pool): State<Pool<Sqlite>>,
    Path(list_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<()>, StatusCode> {
    debug!("Deleting list with id: {}", list_id);

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    info!("Deleting list {} for user {}", list_id, user_id);

    match delete_list_query(&pool, list_id, user_id).await {
        Ok(()) => {
            info!("Successfully deleted list {}", list_id);
            Ok(Json(()))
        }
        Err(sqlx::Error::RowNotFound) => {
            warn!("No list found with id: {} for user: {}", list_id, user_id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to delete list {}: {}", list_id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
