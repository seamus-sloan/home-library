use axum::Json;
use axum::extract::{Path, State};
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{get_all_users, select_user as db_select_user, update_user as db_update_user};
use crate::models::{SelectUser, UpdateUserRequest, User};

pub async fn get_users(State(pool): State<Pool<Sqlite>>) -> Result<Json<Vec<User>>, StatusCode> {
    debug!("Fetching all users from database");

    match get_all_users(&pool).await {
        Ok(users) => {
            info!("Successfully retrieved {} users", users.len());
            Ok(Json(users))
        }
        Err(e) => {
            error!("Failed to fetch users: {}", e);
            warn!("Returning empty user list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn select_user(
    State(pool): State<Pool<Sqlite>>,
    Json(user): Json<SelectUser>,
) -> Result<Json<User>, StatusCode> {
    info!("Selecting user: {}", user.id);

    match db_select_user(&pool, user.id).await {
        Ok(selected_user) => {
            info!("Successfully selected user with ID: {}", selected_user.id);
            Ok(Json(selected_user))
        }
        Err(e) => {
            error!("Failed to select user: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn update_user(
    State(pool): State<Pool<Sqlite>>,
    Path(user_id): Path<i64>,
    Json(request): Json<UpdateUserRequest>,
) -> Result<Json<User>, StatusCode> {
    info!("Updating user with ID: {}", user_id);

    // Convert Option<String> to Option<Option<String>> for the avatar_image
    // If provided, wrap it in Some, otherwise None means "don't change"
    let avatar_image_update = request.avatar_image.map(Some);

    match db_update_user(
        &pool,
        user_id,
        request.name,
        request.color,
        avatar_image_update,
    )
    .await
    {
        Ok(updated_user) => {
            info!("Successfully updated user with ID: {}", updated_user.id);
            Ok(Json(updated_user))
        }
        Err(e) => {
            error!("Failed to update user: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
