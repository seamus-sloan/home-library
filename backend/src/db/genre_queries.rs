use sqlx::{Pool, Sqlite, Error};
use tracing::{info, debug};

use crate::models::books::{Genre, CreateGenreRequest, UpdateGenreRequest};

pub async fn get_all_genres_query(pool: &Pool<Sqlite>) -> Result<Vec<Genre>, Error> {
    debug!("Querying database for all genres");
    
    let genres = sqlx::query_as!(
        Genre,
        "SELECT id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at FROM genres ORDER BY name"
    )
    .fetch_all(pool)
    .await?;

    info!("Found {} genres", genres.len());
    Ok(genres)
}

pub async fn get_genres_by_name_query(pool: &Pool<Sqlite>, name_filter: &str) -> Result<Vec<Genre>, Error> {
    debug!("Querying database for genres with name filter: {}", name_filter);
    
    let pattern = format!("%{}%", name_filter);
    let genres = sqlx::query_as!(
        Genre,
        "SELECT id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at FROM genres WHERE name LIKE ? ORDER BY name",
        pattern
    )
    .fetch_all(pool)
    .await?;

    info!("Found {} genres matching '{}'", genres.len(), name_filter);
    Ok(genres)
}

pub async fn get_genre_by_id_query(pool: &Pool<Sqlite>, id: i64) -> Result<Option<Genre>, Error> {
    debug!("Querying database for genre with id: {}", id);
    
    let genre = sqlx::query_as!(
        Genre,  
        "SELECT id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at FROM genres WHERE id = ?",
        id
    )
    .fetch_optional(pool)
    .await?;

    if let Some(ref g) = genre {
        info!("Found genre with ID {}: '{}'", id, g.name);
    } else {
        info!("No genre found with ID {}", id);
    }

    Ok(genre)
}

pub async fn create_genre_query(pool: &Pool<Sqlite>, genre: &CreateGenreRequest, user_id: i64) -> Result<Genre, Error> {
    debug!("Creating new genre: {}", genre.name);
    
    let result = sqlx::query!(
        "INSERT INTO genres (user_id, name, color) VALUES (?, ?, ?)",
        user_id,
        genre.name,
        genre.color
    )
    .execute(pool)
    .await?;

    let genre_id = result.last_insert_rowid();
    info!("Created genre with ID: {}", genre_id);
    
    // Fetch the created genre to return it
    let created_genre = get_genre_by_id_query(pool, genre_id).await?;
    created_genre.ok_or_else(|| Error::RowNotFound)
}

pub async fn update_genre_query(
    pool: &Pool<Sqlite>,
    id: i64,
    genre: &UpdateGenreRequest,
) -> Result<Genre, Error> {
    debug!("Updating genre with id: {}", id);
    
    let updated_genre = sqlx::query_as!(
        Genre,
        "UPDATE genres SET name = ?, color = ? WHERE id = ? RETURNING id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at",
        genre.name,
        genre.color,
        id
    )
    .fetch_one(pool)
    .await?;

    info!("Updated genre with ID: {}", id);
    Ok(updated_genre)
}

pub async fn delete_genre_query(pool: &Pool<Sqlite>, id: i64) -> Result<(), Error> {
    debug!("Deleting genre with id: {}", id);
    
    let result = sqlx::query!("DELETE FROM genres WHERE id = ?", id)
        .execute(pool)
        .await?;

    let rows_affected = result.rows_affected();
    if rows_affected == 0 {
        return Err(Error::RowNotFound);
    }
    
    info!("Deleted genre with ID: {} (rows affected: {})", id, rows_affected);
    Ok(())
}

pub async fn add_genre_to_book_query(pool: &Pool<Sqlite>, book_id: i64, genre_id: i64) -> Result<(), Error> {
    debug!("Adding genre {} to book {}", genre_id, book_id);
    
    sqlx::query!(
        "INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)",
        book_id,
        genre_id
    )
    .execute(pool)
    .await?;

    info!("Added genre {} to book {}", genre_id, book_id);
    Ok(())
}
