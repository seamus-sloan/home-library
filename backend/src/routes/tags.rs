use axum::Json;
use axum::extract::{Path, Query, State};
use axum::http::HeaderMap;
use reqwest::StatusCode;
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{
    create_tag_query, delete_tag_query, get_all_tags_query, get_tag_by_id_query,
    get_tags_by_name_query, update_tag_query,
};
use crate::models::tags::Tag;
use crate::utils::extract_user_id_from_headers;

#[derive(Deserialize, Debug)]
pub struct TagQueryParams {
    name: Option<String>,
}

pub async fn get_tags(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<TagQueryParams>,
) -> Result<Json<Vec<Tag>>, StatusCode> {
    debug!("Fetching tags from database with params: {:?}", params);

    let tags = match params.name {
        Some(name_filter) => {
            debug!("Filtering tags by name: {}", name_filter);
            get_tags_by_name_query(&pool, &name_filter).await
        }
        None => {
            debug!("Fetching all tags");
            get_all_tags_query(&pool).await
        }
    };

    match tags {
        Ok(tags) => Ok(Json(tags)),
        Err(e) => {
            error!("Failed to fetch tags: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn create_tag(
    State(pool): State<Pool<Sqlite>>,
    headers: HeaderMap,
    Json(mut tag): Json<Tag>,
) -> Result<Json<Tag>, StatusCode> {
    debug!("Creating new tag");

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    // Set the user_id on the tag
    tag.user_id = user_id;

    info!("Creating new tag: {} for user: {}", tag.name, user_id);

    match create_tag_query(&pool, tag).await {
        Ok(tag) => Ok(Json(tag)),
        Err(e) => {
            error!("Failed to create tag: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_tag_by_id(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
) -> Result<Json<Tag>, StatusCode> {
    debug!("Fetching tag with id: {}", id);
    match get_tag_by_id_query(&pool, id).await {
        Ok(Some(tag)) => Ok(Json(tag)),
        Ok(None) => {
            warn!("No tag found with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to fetch tag by id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn update_tag(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
    headers: HeaderMap,
    Json(mut tag): Json<Tag>,
) -> Result<Json<Tag>, StatusCode> {
    debug!("Updating tag with id: {}", id);

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    // Set the user_id on the tag
    tag.user_id = user_id;

    info!("Updating tag with id: {} for user: {}", id, user_id);

    match update_tag_query(&pool, id, tag).await {
        Ok(tag) => Ok(Json(tag)),
        Err(sqlx::Error::RowNotFound) => {
            warn!("No tag found with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to update tag with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
pub async fn delete_tag(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
) -> Result<Json<()>, StatusCode> {
    debug!("Deleting tag with id: {}", id);
    match delete_tag_query(&pool, id).await {
        Ok(()) => {
            info!("Successfully deleted tag with id: {}", id);
            Ok(Json(()))
        }
        Err(e) => {
            error!("Failed to delete tag with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
