use sqlx::{Pool, Sqlite};

use crate::models::lists::{BookInList, CreateListRequest, List, ListWithBooks, UpdateListRequest};

// Get all lists for the current user with their books
pub async fn get_all_lists_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
) -> Result<Vec<ListWithBooks>, sqlx::Error> {
    // First, get all lists for the user
    let lists = sqlx::query_as!(
        List,
        r#"
        SELECT 
            id as "id!",
            user_id as "user_id!",
            type_id as "type_id!",
            name,
            created_at,
            updated_at
        FROM lists
        WHERE user_id = ?
        ORDER BY created_at DESC
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;

    // For each list, get the books
    let mut lists_with_books = Vec::new();
    for list in lists {
        let books = get_books_for_list(pool, list.id, user_id).await?;
        lists_with_books.push(ListWithBooks {
            id: list.id,
            user_id: list.user_id,
            type_id: list.type_id,
            name: list.name,
            books,
        });
    }

    Ok(lists_with_books)
}

// Get a single list by ID with its books
pub async fn get_list_by_id_query(
    pool: &Pool<Sqlite>,
    list_id: i64,
    user_id: i64,
) -> Result<Option<ListWithBooks>, sqlx::Error> {
    let list = sqlx::query_as!(
        List,
        r#"
        SELECT 
            id as "id!",
            user_id as "user_id!",
            type_id as "type_id!",
            name,
            created_at,
            updated_at
        FROM lists
        WHERE id = ? AND user_id = ?
        "#,
        list_id,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    match list {
        Some(list) => {
            let books = get_books_for_list(pool, list.id, user_id).await?;
            Ok(Some(ListWithBooks {
                id: list.id,
                user_id: list.user_id,
                type_id: list.type_id,
                name: list.name,
                books,
            }))
        }
        None => Ok(None),
    }
}

// Helper function to get books for a specific list
async fn get_books_for_list(
    pool: &Pool<Sqlite>,
    list_id: i64,
    user_id: i64,
) -> Result<Vec<BookInList>, sqlx::Error> {
    let books = sqlx::query_as!(
        BookInList,
        r#"
        SELECT 
            b.id as "id!",
            b.cover_image,
            s.name as status_name
        FROM list_books lb
        INNER JOIN books b ON lb.book_id = b.id
        LEFT JOIN reading_status rs ON rs.book_id = b.id AND rs.user_id = ?
        LEFT JOIN status s ON rs.status_id = s.id
        WHERE lb.list_id = ?
        ORDER BY lb.position
        "#,
        user_id,
        list_id
    )
    .fetch_all(pool)
    .await?;

    Ok(books)
}

// Create a new list
pub async fn create_list_query(
    pool: &Pool<Sqlite>,
    user_id: i64,
    request: CreateListRequest,
) -> Result<ListWithBooks, sqlx::Error> {
    // Start a transaction
    let mut tx = pool.begin().await?;

    // Insert the list
    let list = sqlx::query_as!(
        List,
        r#"
        INSERT INTO lists (user_id, type_id, name)
        VALUES (?, ?, ?)
        RETURNING 
            id as "id!",
            user_id as "user_id!",
            type_id as "type_id!",
            name,
            created_at,
            updated_at
        "#,
        user_id,
        request.type_id,
        request.name
    )
    .fetch_one(&mut *tx)
    .await?;

    // Insert the books
    for (position, book_id) in request.books.iter().enumerate() {
        let pos = position as i64;
        sqlx::query!(
            "INSERT INTO list_books (list_id, book_id, position) VALUES (?, ?, ?)",
            list.id,
            book_id,
            pos
        )
        .execute(&mut *tx)
        .await?;
    }

    // Commit the transaction
    tx.commit().await?;

    // Fetch the complete list with books
    match get_list_by_id_query(pool, list.id, user_id).await? {
        Some(list_with_books) => Ok(list_with_books),
        None => Err(sqlx::Error::RowNotFound),
    }
}

// Update an existing list
pub async fn update_list_query(
    pool: &Pool<Sqlite>,
    list_id: i64,
    user_id: i64,
    request: UpdateListRequest,
) -> Result<ListWithBooks, sqlx::Error> {
    // Start a transaction
    let mut tx = pool.begin().await?;

    // First verify the list exists and belongs to the user
    let existing_list = sqlx::query!(
        "SELECT id FROM lists WHERE id = ? AND user_id = ?",
        list_id,
        user_id
    )
    .fetch_optional(&mut *tx)
    .await?;

    if existing_list.is_none() {
        return Err(sqlx::Error::RowNotFound);
    }

    // Update list name and/or type_id if provided
    if request.name.is_some() || request.type_id.is_some() {
        // Build the update query dynamically based on what's provided
        if let (Some(name), Some(type_id)) = (&request.name, request.type_id) {
            sqlx::query!(
                "UPDATE lists SET name = ?, type_id = ?, updated_at = datetime('now') WHERE id = ?",
                name,
                type_id,
                list_id
            )
            .execute(&mut *tx)
            .await?;
        } else if let Some(name) = &request.name {
            sqlx::query!(
                "UPDATE lists SET name = ?, updated_at = datetime('now') WHERE id = ?",
                name,
                list_id
            )
            .execute(&mut *tx)
            .await?;
        } else if let Some(type_id) = request.type_id {
            sqlx::query!(
                "UPDATE lists SET type_id = ?, updated_at = datetime('now') WHERE id = ?",
                type_id,
                list_id
            )
            .execute(&mut *tx)
            .await?;
        }
    }

    // Update books if provided
    if let Some(book_ids) = request.books {
        // Delete existing books
        sqlx::query!("DELETE FROM list_books WHERE list_id = ?", list_id)
            .execute(&mut *tx)
            .await?;

        // Insert new books with their positions
        for (position, book_id) in book_ids.iter().enumerate() {
            let pos = position as i64;
            sqlx::query!(
                "INSERT INTO list_books (list_id, book_id, position) VALUES (?, ?, ?)",
                list_id,
                book_id,
                pos
            )
            .execute(&mut *tx)
            .await?;
        }
    }

    // Commit the transaction
    tx.commit().await?;

    // Fetch and return the updated list with books
    match get_list_by_id_query(pool, list_id, user_id).await? {
        Some(list_with_books) => Ok(list_with_books),
        None => Err(sqlx::Error::RowNotFound),
    }
}

// Delete a list
pub async fn delete_list_query(
    pool: &Pool<Sqlite>,
    list_id: i64,
    user_id: i64,
) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        "DELETE FROM lists WHERE id = ? AND user_id = ?",
        list_id,
        user_id
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }

    Ok(())
}
