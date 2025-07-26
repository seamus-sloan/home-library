use sqlx::{Pool, Sqlite};

use crate::models::tags::Tag;

pub async fn get_all_tags_query(pool: &Pool<Sqlite>) -> Result<Vec<Tag>, sqlx::Error> {
    let rows = sqlx::query_as!(Tag, "SELECT id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at FROM tags")
        .fetch_all(pool)
        .await?;
    Ok(rows)
}

pub async fn get_tag_by_id_query(pool: &Pool<Sqlite>, id: i64) -> Result<Option<Tag>, sqlx::Error> {
    let tag = sqlx::query_as!(Tag, "SELECT id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at FROM tags WHERE id = ?", id)
        .fetch_optional(pool)
        .await?;

    Ok(tag)
}

pub async fn create_tag_query(pool: &Pool<Sqlite>, tag: Tag) -> Result<Tag, sqlx::Error> {
    let tag = sqlx::query_as!(
        Tag,
        "INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?) RETURNING id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at",
        tag.user_id,
        tag.name,
        tag.color
    )
    .fetch_one(pool)
    .await?;

    Ok(tag)
}

pub async fn update_tag_query(pool: &Pool<Sqlite>, id: i64, tag: Tag) -> Result<Tag, sqlx::Error> {
    let updated_tag = sqlx::query_as!(
        Tag,
        "UPDATE tags SET name = ?, color = ? WHERE id = ? RETURNING id as \"id!\", user_id as \"user_id!\", name, color, created_at, updated_at",
        tag.name,
        tag.color,
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(updated_tag)
}

pub async fn delete_tag_query(pool: &Pool<Sqlite>, id: i64) -> Result<(), sqlx::Error> {
    let result = sqlx::query!("DELETE FROM tags WHERE id = ?", id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }

    Ok(())
}
