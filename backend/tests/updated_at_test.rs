mod common;
mod utils;

use axum::http::StatusCode;
use chrono::{DateTime, Utc};
use common::TestApp;
use serde_json::json;
use std::time::Duration;
use tokio::time::sleep;
use utils::make_request;

/// Parse SQLite datetime string to DateTime<Utc>
fn parse_datetime(datetime_str: &str) -> DateTime<Utc> {
    // SQLite datetime() returns format like "2025-07-27 15:01:17"
    // We need to convert it to ISO format
    let iso_string = format!("{}Z", datetime_str.replace(" ", "T"));
    DateTime::parse_from_rfc3339(&iso_string)
        .unwrap()
        .with_timezone(&Utc)
}

/// Test that books' updated_at field is properly updated on modifications
#[tokio::test]
async fn test_books_updated_at_on_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Original Title", "Original Author")
        .await;

    // Get the initial book data
    let (status, initial_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let initial_updated_at = initial_body["updated_at"].as_str().unwrap();
    let initial_created_at = initial_body["created_at"].as_str().unwrap();

    // Ensure created_at and updated_at are initially the same
    assert_eq!(initial_created_at, initial_updated_at);

    // Wait a moment to ensure timestamp difference
    sleep(Duration::from_millis(1000)).await;

    // Update the book
    let update_data = json!({
        "title": "Updated Title",
        "author": "Updated Author"
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    let updated_created_at = updated_body["created_at"].as_str().unwrap();

    // Verify created_at hasn't changed
    assert_eq!(initial_created_at, updated_created_at);

    // Verify updated_at has changed and is more recent
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that books' updated_at field is updated when tags are modified
#[tokio::test]
async fn test_books_updated_at_on_tag_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Book for Tag Update", "Author")
        .await;

    // Get initial timestamp
    let (status, initial_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let initial_updated_at = initial_body["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Create and add tags
    let tag_id = test_app
        .create_test_tag(user_id, "New Tag", "#ff0000")
        .await;

    let update_data = json!({
        "tags": [tag_id]
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that books' updated_at field is updated when genres are modified
#[tokio::test]
async fn test_books_updated_at_on_genre_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Book for Genre Update", "Author")
        .await;

    // Get initial timestamp
    let (status, initial_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let initial_updated_at = initial_body["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Create and add genres
    let genre_id = test_app
        .create_test_genre(user_id, "New Genre", "#00ff00")
        .await;

    let update_data = json!({
        "genres": [genre_id]
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that books' updated_at field is updated when rating is modified
#[tokio::test]
async fn test_books_updated_at_on_rating_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Book for Rating Update", "Author")
        .await;

    // Get initial timestamp
    let (status, initial_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let initial_updated_at = initial_body["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update rating
    let update_data = json!({
        "rating": 4.5
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that users' updated_at field is properly updated on modifications
#[tokio::test]
async fn test_users_updated_at_on_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Get initial user data
    let (status, initial_body) = make_request(&test_app, "GET", "/users", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let users = initial_body.as_array().unwrap();
    let user = users.iter().find(|u| u["id"] == user_id).unwrap();
    let initial_updated_at = user["updated_at"].as_str().unwrap();
    let initial_created_at = user["created_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update user
    let update_data = json!({
        "name": "Updated User Name",
        "color": "#ff0000"
    });

    let (status, _) = make_request(
        &test_app,
        "PUT",
        &format!("/users/{}", user_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Get updated user data
    let (status, updated_body) = make_request(&test_app, "GET", "/users", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let updated_users = updated_body.as_array().unwrap();
    let updated_user = updated_users.iter().find(|u| u["id"] == user_id).unwrap();
    let updated_updated_at = updated_user["updated_at"].as_str().unwrap();
    let updated_created_at = updated_user["created_at"].as_str().unwrap();

    // Verify created_at hasn't changed
    assert_eq!(initial_created_at, updated_created_at);

    // Verify updated_at has changed
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that tags' updated_at field is properly updated on modifications
#[tokio::test]
async fn test_tags_updated_at_on_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a tag
    let tag_id = test_app
        .create_test_tag(user_id, "Original Tag", "#ff0000")
        .await;

    // Get initial tag data
    let (status, initial_body) = make_request(&test_app, "GET", "/tags", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let tags = initial_body.as_array().unwrap();
    let tag = tags.iter().find(|t| t["id"] == tag_id).unwrap();
    let initial_updated_at = tag["updated_at"].as_str().unwrap();
    let initial_created_at = tag["created_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update the tag
    let update_data = json!({
        "name": "Updated Tag Name",
        "color": "#00ff00"
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/tags/{}", tag_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    let updated_created_at = updated_body["created_at"].as_str().unwrap();

    // Verify created_at hasn't changed
    assert_eq!(initial_created_at, updated_created_at);

    // Verify updated_at has changed and is more recent
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that genres' updated_at field is properly updated on modifications
#[tokio::test]
async fn test_genres_updated_at_on_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a genre
    let genre_id = test_app
        .create_test_genre(user_id, "Original Genre", "#ff0000")
        .await;

    // Get initial genre data
    let (status, initial_body) = make_request(&test_app, "GET", "/genres", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let genres = initial_body.as_array().unwrap();
    let genre = genres.iter().find(|g| g["id"] == genre_id).unwrap();
    let initial_updated_at = genre["updated_at"].as_str().unwrap();
    let initial_created_at = genre["created_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update the genre
    let update_data = json!({
        "name": "Updated Genre Name",
        "color": "#00ff00"
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/genres/{}", genre_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    let updated_created_at = updated_body["created_at"].as_str().unwrap();

    // Verify created_at hasn't changed
    assert_eq!(initial_created_at, updated_created_at);

    // Verify updated_at has changed and is more recent
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that journal entries' updated_at field is properly updated on modifications
#[tokio::test]
async fn test_journal_entries_updated_at_on_update() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book and journal entry
    let book_id = test_app
        .create_test_book(user_id, "Book with Journal", "Author")
        .await;

    let journal_data = json!({
        "title": "Original Journal Title",
        "content": "Original journal content"
    });

    let (status, journal_body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let journal_id = journal_body["id"].as_i64().unwrap();
    let initial_updated_at = journal_body["updated_at"].as_str().unwrap();
    let initial_created_at = journal_body["created_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update the journal entry
    let update_data = json!({
        "title": "Updated Journal Title",
        "content": "Updated journal content"
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}/journals/{}", book_id, journal_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();
    let updated_created_at = updated_body["created_at"].as_str().unwrap();

    // Verify created_at hasn't changed
    assert_eq!(initial_created_at, updated_created_at);

    // Verify updated_at has changed and is more recent
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test that updated_at fields are properly set during creation
#[tokio::test]
async fn test_updated_at_set_on_creation() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test book creation
    let book_data = json!({
        "user_id": user_id,
        "title": "New Book",
        "author": "New Author",
        "cover_image": null,
        "rating": null,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, book_body) =
        make_request(&test_app, "POST", "/books", user_id, Some(book_data)).await;
    assert_eq!(status, StatusCode::OK);

    // Verify updated_at is set and matches created_at initially
    assert!(book_body["updated_at"].as_str().is_some());
    assert!(book_body["created_at"].as_str().is_some());

    // Test tag creation
    let tag_data = json!({
        "name": "New Tag",
        "color": "#ff0000"
    });

    let (status, tag_body) =
        make_request(&test_app, "POST", "/tags", user_id, Some(tag_data)).await;
    assert_eq!(status, StatusCode::OK);

    assert!(tag_body["updated_at"].as_str().is_some());
    assert!(tag_body["created_at"].as_str().is_some());

    // Test genre creation
    let genre_data = json!({
        "name": "New Genre",
        "color": "#00ff00"
    });

    let (status, genre_body) =
        make_request(&test_app, "POST", "/genres", user_id, Some(genre_data)).await;
    assert_eq!(status, StatusCode::OK);

    assert!(genre_body["updated_at"].as_str().is_some());
    assert!(genre_body["created_at"].as_str().is_some());
}

/// Test that multiple updates continue to update the updated_at field correctly
#[tokio::test]
async fn test_multiple_updates_keep_updating_updated_at() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Multi-Update Book", "Author")
        .await;

    // Get initial timestamp
    let (status, initial_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let first_updated_at = initial_body["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // First update
    let update1_data = json!({
        "title": "First Update"
    });

    let (status, update1_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update1_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let second_updated_at = update1_body["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Second update
    let update2_data = json!({
        "title": "Second Update"
    });

    let (status, update2_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update2_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let third_updated_at = update2_body["updated_at"].as_str().unwrap();

    // Verify each update_at is different and progressively more recent
    assert_ne!(first_updated_at, second_updated_at);
    assert_ne!(second_updated_at, third_updated_at);
    assert_ne!(first_updated_at, third_updated_at);

    let first_time = parse_datetime(first_updated_at);
    let second_time = parse_datetime(second_updated_at);
    let third_time = parse_datetime(third_updated_at);

    assert!(second_time > first_time);
    assert!(third_time > second_time);
    assert!(third_time > first_time);
}

/// Test that updated_at is updated when only some fields change
#[tokio::test]
async fn test_partial_updates_still_update_updated_at() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Partial Update Book", "Original Author")
        .await;

    let (status, initial_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let initial_updated_at = initial_body["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update only the author field
    let update_data = json!({
        "author": "Updated Author"
    });

    let (status, updated_body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let updated_updated_at = updated_body["updated_at"].as_str().unwrap();

    // Verify title remained the same but updated_at changed
    assert_eq!(updated_body["title"], "Partial Update Book");
    assert_eq!(updated_body["author"], "Updated Author");
    assert_ne!(initial_updated_at, updated_updated_at);

    let initial_time = parse_datetime(initial_updated_at);
    let updated_time = parse_datetime(updated_updated_at);
    assert!(updated_time > initial_time);
}

/// Test whether updating tags/genres via PUT /books updates the tag/genre updated_at fields
#[tokio::test]
async fn test_book_tag_genre_updates_do_not_update_tag_genre_timestamps() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Book for Testing", "Author")
        .await;

    // Create tags and genres
    let tag_id = test_app
        .create_test_tag(user_id, "Test Tag", "#ff0000")
        .await;
    let genre_id = test_app
        .create_test_genre(user_id, "Test Genre", "#00ff00")
        .await;

    // Get initial tag and genre timestamps
    let (status, tags_body) = make_request(&test_app, "GET", "/tags", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let tags = tags_body.as_array().unwrap();
    let tag = tags.iter().find(|t| t["id"] == tag_id).unwrap();
    let initial_tag_updated_at = tag["updated_at"].as_str().unwrap();

    let (status, genres_body) = make_request(&test_app, "GET", "/genres", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let genres = genres_body.as_array().unwrap();
    let genre = genres.iter().find(|g| g["id"] == genre_id).unwrap();
    let initial_genre_updated_at = genre["updated_at"].as_str().unwrap();

    sleep(Duration::from_millis(1000)).await;

    // Update the book to associate with tags and genres
    let update_data = json!({
        "tags": [tag_id],
        "genres": [genre_id]
    });

    let (status, _) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Check if tag and genre updated_at timestamps changed
    let (status, updated_tags_body) = make_request(&test_app, "GET", "/tags", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let updated_tags = updated_tags_body.as_array().unwrap();
    let updated_tag = updated_tags.iter().find(|t| t["id"] == tag_id).unwrap();
    let final_tag_updated_at = updated_tag["updated_at"].as_str().unwrap();

    let (status, updated_genres_body) = make_request(&test_app, "GET", "/genres", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let updated_genres = updated_genres_body.as_array().unwrap();
    let updated_genre = updated_genres.iter().find(|g| g["id"] == genre_id).unwrap();
    let final_genre_updated_at = updated_genre["updated_at"].as_str().unwrap();

    // Verify that tag and genre updated_at fields were NOT changed
    // (This confirms that associating tags/genres with books doesn't update their timestamps)
    assert_eq!(
        initial_tag_updated_at, final_tag_updated_at,
        "Tag updated_at should NOT change when associated with a book"
    );
    assert_eq!(
        initial_genre_updated_at, final_genre_updated_at,
        "Genre updated_at should NOT change when associated with a book"
    );
}
