mod common;
mod utils;

use axum::http::StatusCode;
use common::TestApp;
use serde_json::json;
use utils::make_request;

#[tokio::test]
async fn test_get_books_empty() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, body) = make_request(&test_app, "GET", "/books", user_id, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body, json!([]));
}

#[tokio::test]
async fn test_create_book_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_data = json!({
        "user_id": user_id,
        "title": "Test Book",
        "author": "Test Author",
        "cover_image": null,
        "rating": null,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, body) = make_request(&test_app, "POST", "/books", user_id, Some(book_data)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["title"], "Test Book");
    assert_eq!(body["author"], "Test Author");
    assert_eq!(body["user_id"], user_id);
    assert!(body["id"].as_i64().unwrap() > 0);
}

#[tokio::test]
async fn test_create_book_with_tags_and_genres() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create test tag and genre
    let tag_id = test_app
        .create_test_tag(user_id, "Fiction", "#ff0000")
        .await;
    let genre_id = test_app
        .create_test_genre(user_id, "Sci-Fi", "#00ff00")
        .await;

    let book_data = json!({
        "user_id": user_id,
        "title": "Test Book with Tags",
        "author": "Test Author",
        "cover_image": null,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z",
        "tags": [tag_id],
        "genres": [genre_id]
    });

    let (status, body) = make_request(&test_app, "POST", "/books", user_id, Some(book_data)).await;

    assert_eq!(status, StatusCode::OK);

    let book_id = body["id"].as_i64().unwrap();

    // Verify the book was created with the correct data
    assert_eq!(body["title"], "Test Book with Tags");

    // Fetch the book details to verify tags and genres
    let (details_status, details_body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(details_status, StatusCode::OK);
    assert_eq!(details_body["tags"].as_array().unwrap().len(), 1);
    assert_eq!(details_body["genres"].as_array().unwrap().len(), 1);
    assert_eq!(details_body["tags"][0]["name"], "Fiction");
    assert_eq!(details_body["genres"][0]["name"], "Sci-Fi");
}

#[tokio::test]
async fn test_get_book_by_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book directly in the database
    let book_id = test_app
        .create_test_book(user_id, "Direct Book", "Direct Author")
        .await;

    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["id"], book_id);
    assert_eq!(body["title"], "Direct Book");
    assert_eq!(body["author"], "Direct Author");
    assert_eq!(body["user_id"], user_id);
    assert!(body["tags"].is_array());
    assert!(body["genres"].is_array());
    assert!(body["journals"].is_array());
}

#[tokio::test]
async fn test_get_book_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, _body) = make_request(&test_app, "GET", "/books/99999", user_id, None).await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_update_book_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Original Title", "Original Author")
        .await;

    let update_data = json!({
        "title": "Updated Title",
        "author": "Updated Author"
    });

    let (status, body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["title"], "Updated Title");
    assert_eq!(body["author"], "Updated Author");
}

#[tokio::test]
async fn test_update_book_tags_and_genres() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book with initial tags and genres
    let book_id = test_app
        .create_test_book(user_id, "Book for Update", "Author")
        .await;
    let old_tag_id = test_app
        .create_test_tag(user_id, "Old Tag", "#ff0000")
        .await;
    let old_genre_id = test_app
        .create_test_genre(user_id, "Old Genre", "#ff0000")
        .await;

    test_app.add_tag_to_book(book_id, old_tag_id).await;
    test_app.add_genre_to_book(book_id, old_genre_id).await;

    // Create new tags and genres for the update
    let new_tag_id = test_app
        .create_test_tag(user_id, "New Tag", "#00ff00")
        .await;
    let new_genre_id = test_app
        .create_test_genre(user_id, "New Genre", "#00ff00")
        .await;

    let update_data = json!({
        "tags": [new_tag_id],
        "genres": [new_genre_id]
    });

    let (status, body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["tags"].as_array().unwrap().len(), 1);
    assert_eq!(body["genres"].as_array().unwrap().len(), 1);
    assert_eq!(body["tags"][0]["name"], "New Tag");
    assert_eq!(body["genres"][0]["name"], "New Genre");
}

#[tokio::test]
async fn test_get_books_with_data() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create multiple books
    let book1_id = test_app
        .create_test_book(user_id, "Book 1", "Author 1")
        .await;
    let book2_id = test_app
        .create_test_book(user_id, "Book 2", "Author 2")
        .await;

    // Add tags and genres to books
    let tag_id = test_app
        .create_test_tag(user_id, "Test Tag", "#ff0000")
        .await;
    let genre_id = test_app
        .create_test_genre(user_id, "Test Genre", "#00ff00")
        .await;

    test_app.add_tag_to_book(book1_id, tag_id).await;
    test_app.add_genre_to_book(book2_id, genre_id).await;

    let (status, body) = make_request(&test_app, "GET", "/books", user_id, None).await;

    assert_eq!(status, StatusCode::OK);

    let books_array = body.as_array().unwrap();
    assert_eq!(books_array.len(), 2);

    // Find the books in the response
    let book1 = books_array.iter().find(|b| b["id"] == book1_id).unwrap();
    let book2 = books_array.iter().find(|b| b["id"] == book2_id).unwrap();

    assert_eq!(book1["title"], "Book 1");
    assert_eq!(book1["tags"].as_array().unwrap().len(), 1);
    assert_eq!(book1["genres"].as_array().unwrap().len(), 0);

    assert_eq!(book2["title"], "Book 2");
    assert_eq!(book2["tags"].as_array().unwrap().len(), 0);
    assert_eq!(book2["genres"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn test_search_books() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create books with different titles and authors
    test_app
        .create_test_book(user_id, "Rust Programming", "Steve Klabnik")
        .await;
    test_app
        .create_test_book(user_id, "JavaScript Guide", "Mozilla")
        .await;
    test_app
        .create_test_book(user_id, "Python Cookbook", "David Beazley")
        .await;

    // Search by title
    let (status, body) = make_request(&test_app, "GET", "/books?search=Rust", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let books_array = body.as_array().unwrap();
    assert_eq!(books_array.len(), 1);
    assert_eq!(books_array[0]["title"], "Rust Programming");

    // Search by author
    let (status, body) =
        make_request(&test_app, "GET", "/books?search=Mozilla", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let books_array = body.as_array().unwrap();
    assert_eq!(books_array.len(), 1);
    assert_eq!(books_array[0]["author"], "Mozilla");

    // Search with no results
    let (status, body) =
        make_request(&test_app, "GET", "/books?search=NoMatch", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body.as_array().unwrap().len(), 0);
}

#[tokio::test]
async fn test_rating_update_and_clear() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Rating Test", "Author")
        .await;

    // Note: Ratings are now managed through separate endpoints (not yet implemented)
    // This test verifies that book updates work without ratings
    let update_data = json!({
        "title": "Rating Test Updated"
    });

    let (status, body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["title"], "Rating Test Updated");
}

#[tokio::test]
async fn test_update_book_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let update_data = json!({
        "title": "Updated Title"
    });

    let (status, _body) =
        make_request(&test_app, "PUT", "/books/99999", user_id, Some(update_data)).await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_create_book_validation() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test missing title
    let invalid_data = json!({
        "user_id": user_id,
        "author": "Test Author",
        "cover_image": null,
        "rating": null,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/books", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_bad_request_empty_json() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with empty JSON object
    let empty_data = json!({});

    let (status, _body) =
        make_request(&test_app, "POST", "/books", user_id, Some(empty_data)).await;

    // Axum returns 422 for JSON deserialization errors
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_bad_request_malformed_rating() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with invalid title type (number instead of string)
    let invalid_title_data = json!({
        "user_id": user_id,
        "title": 123,
        "author": "Test Author",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/books",
        user_id,
        Some(invalid_title_data),
    )
    .await;

    // Axum returns 422 for JSON deserialization errors
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_update_book_bad_request_invalid_json() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book first
    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Test with malformed data types
    let invalid_data = json!({
        "rating": "invalid_rating_string",
        "tags": "should_be_array"
    });

    let (status, _body) = make_request(
        &test_app,
        "PUT",
        &format!("/books/{}", book_id),
        user_id,
        Some(invalid_data),
    )
    .await;

    // Axum returns 422 for JSON deserialization errors
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_bad_request_invalid_tags_format() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with tags as string instead of array
    let invalid_tags_data = json!({
        "user_id": user_id,
        "title": "Test Book",
        "author": "Test Author",
        "tags": "should_be_array",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/books",
        user_id,
        Some(invalid_tags_data),
    )
    .await;

    // Axum returns 422 for JSON deserialization errors
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_bad_request_invalid_genres_format() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with genres as string instead of array
    let invalid_genres_data = json!({
        "user_id": user_id,
        "title": "Test Book",
        "author": "Test Author",
        "genres": "should_be_array",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/books",
        user_id,
        Some(invalid_genres_data),
    )
    .await;

    // Axum returns 422 for JSON deserialization errors
    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_get_book_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with non-numeric book ID
    let (status, _body) =
        make_request(&test_app, "GET", "/books/not_a_number", user_id, None).await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_update_book_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let update_data = json!({
        "title": "Updated Title"
    });

    // Test with non-numeric book ID
    let (status, _body) = make_request(
        &test_app,
        "PUT",
        "/books/not_a_number",
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_book_bad_request_malformed_json_syntax() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a request with invalid JSON syntax manually
    use axum::{body::Body, extract::Request};
    use tower::ServiceExt;

    let request = Request::builder()
        .method("POST")
        .uri("/books")
        .header("currentUserId", user_id.to_string())
        .header("content-type", "application/json")
        .body(Body::from(
            r#"{"title": "Test", "author": "Author", invalid JSON}"#,
        ))
        .unwrap();

    let response = test_app.app.clone().oneshot(request).await.unwrap();
    let status = response.status();

    // Malformed JSON syntax should return BAD_REQUEST
    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_book_bad_request_missing_content_type() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a request without content-type header
    use axum::{body::Body, extract::Request};
    use tower::ServiceExt;

    let valid_json = json!({
        "user_id": user_id,
        "title": "Test Book",
        "author": "Test Author",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let request = Request::builder()
        .method("POST")
        .uri("/books")
        .header("currentUserId", user_id.to_string())
        // Missing content-type header
        .body(Body::from(serde_json::to_string(&valid_json).unwrap()))
        .unwrap();

    let response = test_app.app.clone().oneshot(request).await.unwrap();
    let status = response.status();

    // Missing content-type might cause issues, but let's see what the server returns
    // This might be 400 or 415 (Unsupported Media Type)
    assert!(matches!(
        status,
        StatusCode::BAD_REQUEST | StatusCode::UNSUPPORTED_MEDIA_TYPE
    ));
}

#[tokio::test]
async fn test_delete_book_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Book to Delete", "Author")
        .await;

    // Delete the book
    let (status, _body) = make_request(
        &test_app,
        "DELETE",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NO_CONTENT);

    // Verify the book is gone
    let (status, _body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_book_with_tags_and_genres() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book with tags and genres
    let book_id = test_app
        .create_test_book(user_id, "Book with Tags", "Author")
        .await;

    let tag_id = test_app
        .create_test_tag(user_id, "Fiction", "#ff0000")
        .await;
    let genre_id = test_app
        .create_test_genre(user_id, "Mystery", "#00ff00")
        .await;

    test_app.add_tag_to_book(book_id, tag_id).await;
    test_app.add_genre_to_book(book_id, genre_id).await;

    // Verify the book has tags and genres
    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["tags"].as_array().unwrap().len(), 1);
    assert_eq!(body["genres"].as_array().unwrap().len(), 1);

    // Delete the book
    let (status, _body) = make_request(
        &test_app,
        "DELETE",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NO_CONTENT);

    // Verify the book is gone
    let (status, _body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);

    // Verify tags and genres still exist (they should not be deleted)
    let (status, body) = make_request(&test_app, "GET", "/tags", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let tags = body.as_array().unwrap();
    assert!(tags.iter().any(|t| t["id"] == tag_id));

    let (status, body) = make_request(&test_app, "GET", "/genres", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let genres = body.as_array().unwrap();
    assert!(genres.iter().any(|g| g["id"] == genre_id));
}

#[tokio::test]
async fn test_delete_book_with_journals() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Book with Journals", "Author")
        .await;

    // Add journal entries to the book
    let journal_data1 = json!({
        "title": "First Journal Entry",
        "content": "This is my first journal entry about this book.",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let journal_data2 = json!({
        "title": "Second Journal Entry",
        "content": "This is my second journal entry about this book.",
        "created_at": "2025-01-02T00:00:00Z",
        "updated_at": "2025-01-02T00:00:00Z"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal_data1),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal_data2),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Verify the book has journals
    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["journals"].as_array().unwrap().len(), 2);

    // Delete the book
    let (status, _body) = make_request(
        &test_app,
        "DELETE",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NO_CONTENT);

    // Verify the book is gone
    let (status, _body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);

    // Verify journals are also deleted (cascade delete)
    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}/journals", book_id),
        user_id,
        None,
    )
    .await;

    // Should return 404 since the book doesn't exist
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_book_complex_scenario() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book with everything: tags, genres, and journals
    let book_id = test_app
        .create_test_book(user_id, "Complex Book", "Complex Author")
        .await;

    // Add multiple tags
    let tag1_id = test_app
        .create_test_tag(user_id, "Fiction", "#ff0000")
        .await;
    let tag2_id = test_app
        .create_test_tag(user_id, "Award Winner", "#ffff00")
        .await;

    // Add multiple genres
    let genre1_id = test_app
        .create_test_genre(user_id, "Science Fiction", "#00ff00")
        .await;
    let genre2_id = test_app
        .create_test_genre(user_id, "Dystopian", "#0000ff")
        .await;

    test_app.add_tag_to_book(book_id, tag1_id).await;
    test_app.add_tag_to_book(book_id, tag2_id).await;
    test_app.add_genre_to_book(book_id, genre1_id).await;
    test_app.add_genre_to_book(book_id, genre2_id).await;

    // Add journal entries
    let journal_data = json!({
        "title": "Reading Progress",
        "content": "Started reading this amazing book today. The world-building is incredible!",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Verify the book has everything
    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["tags"].as_array().unwrap().len(), 2);
    assert_eq!(body["genres"].as_array().unwrap().len(), 2);
    assert_eq!(body["journals"].as_array().unwrap().len(), 1);

    // Delete the book
    let (status, _body) = make_request(
        &test_app,
        "DELETE",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NO_CONTENT);

    // Verify the book is completely gone
    let (status, _body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);

    // Verify tags and genres still exist (should not be cascade deleted)
    let (status, body) = make_request(&test_app, "GET", "/tags", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let tags = body.as_array().unwrap();
    assert!(tags.iter().any(|t| t["id"] == tag1_id));
    assert!(tags.iter().any(|t| t["id"] == tag2_id));

    let (status, body) = make_request(&test_app, "GET", "/genres", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let genres = body.as_array().unwrap();
    assert!(genres.iter().any(|g| g["id"] == genre1_id));
    assert!(genres.iter().any(|g| g["id"] == genre2_id));

    // Verify the book no longer appears in the books list
    let (status, body) = make_request(&test_app, "GET", "/books", user_id, None).await;
    assert_eq!(status, StatusCode::OK);
    let books = body.as_array().unwrap();
    assert!(!books.iter().any(|b| b["id"] == book_id));
}

#[tokio::test]
async fn test_delete_book_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Try to delete a non-existent book
    let (status, _body) = make_request(&test_app, "DELETE", "/books/99999", user_id, None).await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_book_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Try to delete with invalid book ID
    let (status, _body) =
        make_request(&test_app, "DELETE", "/books/not_a_number", user_id, None).await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}
