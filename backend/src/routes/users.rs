use axum::Json;
use axum::extract::State;
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

use crate::db::{get_all_users, select_user as db_select_user};
use crate::models::{SelectUser, User};

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
