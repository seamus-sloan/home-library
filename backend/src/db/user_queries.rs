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

pub async fn update_user(
    pool: &Pool<Sqlite>,
    user_id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<User, sqlx::Error> {
    debug!("Updating user with ID: {}", user_id);

    // Get current user data to fill in missing fields
    let current_user = sqlx::query_as!(
        User,
        "SELECT id, name, color, created_at, updated_at, last_login FROM users WHERE id = ?",
        user_id
    )
    .fetch_one(pool)
    .await?;

    let final_name = name.unwrap_or(current_user.name);
    let final_color = color.unwrap_or(current_user.color);

    let updated_user = sqlx::query_as!(
        User,
        "UPDATE users SET name = ?, color = ?, updated_at = datetime('now') WHERE id = ? 
         RETURNING id, name, color, created_at, updated_at, last_login",
        final_name,
        final_color,
        user_id
    )
    .fetch_one(pool)
    .await?;

    info!(
        "Updated user with ID {}: name='{}', color='{}'",
        updated_user.id, updated_user.name, updated_user.color
    );
    Ok(updated_user)
}
