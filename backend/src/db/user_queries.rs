use sqlx::{Pool, Sqlite};
use tracing::{debug, info};

use crate::models::User;

// User queries
pub async fn get_all_users(pool: &Pool<Sqlite>) -> Result<Vec<User>, sqlx::Error> {
    debug!("Querying database for all users");

    let users = sqlx::query_as!(
        User,
        "SELECT id, name, color, created_at, updated_at, last_login FROM users"
    )
    .fetch_all(pool)
    .await?;

    info!("Retrieved {} users from database", users.len());
    if users.is_empty() {
        debug!("No users found in database");
    } else {
        debug!(
            "User names: {:?}",
            users.iter().map(|u| &u.name).collect::<Vec<_>>()
        );
    }

    Ok(users)
}

pub async fn select_user(pool: &Pool<Sqlite>, user_id: i64) -> Result<User, sqlx::Error> {
    debug!("Querying database for user with ID: {}", user_id);

    // Update last_login and return the updated user in one query
    let user = sqlx::query_as!(
        User,
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ? 
         RETURNING id, name, color, created_at, updated_at, last_login",
        user_id
    )
    .fetch_one(pool)
    .await?;

    info!(
        "Selected user with ID {}: '{}' (last_login updated)",
        user.id, user.name
    );
    Ok(user)
}
