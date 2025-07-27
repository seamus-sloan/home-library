use axum::Json;
use axum::extract::{Path, Query, State};
use axum::http::HeaderMap;
use reqwest::StatusCode;
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{
    create_genre_query, delete_genre_query, get_all_genres_query, get_genre_by_id_query,
    get_genres_by_name_query, update_genre_query,
};
use crate::models::books::{CreateGenreRequest, Genre, UpdateGenreRequest};
use crate::utils::extract_user_id_from_headers;

#[derive(Deserialize, Debug)]
pub struct GenreQueryParams {
    name: Option<String>,
}

pub async fn get_genres(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<GenreQueryParams>,
) -> Result<Json<Vec<Genre>>, StatusCode> {
    debug!("Fetching genres from database with params: {:?}", params);

    let genres = match params.name {
        Some(name_filter) => {
            debug!("Filtering genres by name: {}", name_filter);
            get_genres_by_name_query(&pool, &name_filter).await
        }
        None => {
            debug!("Fetching all genres");
            get_all_genres_query(&pool).await
        }
    };

    match genres {
        Ok(genres) => Ok(Json(genres)),
        Err(e) => {
            error!("Failed to fetch genres: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn create_genre(
    State(pool): State<Pool<Sqlite>>,
    headers: HeaderMap,
    Json(genre): Json<CreateGenreRequest>,
) -> Result<Json<Genre>, StatusCode> {
    debug!("Creating new genre");

    // Extract user_id from headers
    let user_id = extract_user_id_from_headers(&headers)?;

    info!("Creating new genre: {} for user: {}", genre.name, user_id);

    match create_genre_query(&pool, &genre, user_id).await {
        Ok(genre) => Ok(Json(genre)),
        Err(e) => {
            error!("Failed to create genre: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_genre_by_id(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
) -> Result<Json<Genre>, StatusCode> {
    debug!("Fetching genre with id: {}", id);
    match get_genre_by_id_query(&pool, id).await {
        Ok(Some(genre)) => Ok(Json(genre)),
        Ok(None) => {
            warn!("No genre found with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to fetch genre by id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn update_genre(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
    headers: HeaderMap,
    Json(genre): Json<UpdateGenreRequest>,
) -> Result<Json<Genre>, StatusCode> {
    debug!("Updating genre with id: {}", id);

    // Extract user_id from headers
    let _user_id = extract_user_id_from_headers(&headers)?;

    info!("Updating genre with id: {} for user: {}", id, _user_id);

    match update_genre_query(&pool, id, &genre).await {
        Ok(genre) => Ok(Json(genre)),
        Err(sqlx::Error::RowNotFound) => {
            warn!("No genre found with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        }
        Err(e) => {
            error!("Failed to update genre with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn delete_genre(
    State(pool): State<Pool<Sqlite>>,
    Path(id): Path<i64>,
) -> Result<Json<()>, StatusCode> {
    debug!("Deleting genre with id: {}", id);
    match delete_genre_query(&pool, id).await {
        Ok(()) => {
            info!("Successfully deleted genre with id: {}", id);
            Ok(Json(()))
        }
        Err(e) => {
            error!("Failed to delete genre with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
