mod common;
mod utils;

use axum::http::StatusCode;
use common::TestApp;
use serde_json::json;
use utils::make_request;

#[tokio::test]
async fn test_get_journals_empty() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, body) = make_request(&test_app, "GET", "/journals", user_id, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body, json!([]));
}

#[tokio::test]
async fn test_get_journal_by_id_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, body) = make_request(&test_app, "GET", "/journals/99999", user_id, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body, json!(null));
}

#[tokio::test]
async fn test_get_book_journals_empty() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}/journals", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body, json!([]));
}

#[tokio::test]
async fn test_create_book_journal_entry() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    let journal_data = json!({
        "title": "My Reading Thoughts",
        "content": "This is a fascinating book about science fiction and technology."
    });

    let (status, body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["title"], "My Reading Thoughts");
    assert_eq!(
        body["content"],
        "This is a fascinating book about science fiction and technology."
    );
    assert_eq!(body["book_id"], book_id);
    assert_eq!(body["user_id"], user_id);
    assert!(body["id"].as_i64().unwrap() > 0);
    // created_at might be null or string, just check it exists
    assert!(body.get("created_at").is_some());
}

#[tokio::test]
async fn test_get_book_journals_with_data() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book
    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Create journal entries
    let journal1_data = json!({
        "title": "First Entry",
        "content": "First thoughts about this book."
    });

    let journal2_data = json!({
        "title": "Second Entry",
        "content": "More thoughts about this book."
    });

    let (status1, body1) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal1_data),
    )
    .await;
    assert_eq!(status1, StatusCode::OK);

    let (status2, body2) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal2_data),
    )
    .await;
    assert_eq!(status2, StatusCode::OK);

    // Get all journals for the book
    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/books/{}/journals", book_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);

    let journals_array = body.as_array().unwrap();
    assert_eq!(journals_array.len(), 2);

    // Find the journals in the response
    let journal1_id = body1["id"].as_i64().unwrap();
    let journal2_id = body2["id"].as_i64().unwrap();

    let journal1 = journals_array
        .iter()
        .find(|j| j["id"] == journal1_id)
        .unwrap();
    let journal2 = journals_array
        .iter()
        .find(|j| j["id"] == journal2_id)
        .unwrap();

    assert_eq!(journal1["title"], "First Entry");
    assert_eq!(journal1["content"], "First thoughts about this book.");
    assert_eq!(journal1["book_id"], book_id);

    assert_eq!(journal2["title"], "Second Entry");
    assert_eq!(journal2["content"], "More thoughts about this book.");
    assert_eq!(journal2["book_id"], book_id);
}

#[tokio::test]
async fn test_get_all_journals_with_data() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create two books
    let book1_id = test_app
        .create_test_book(user_id, "Book One", "Author One")
        .await;
    let book2_id = test_app
        .create_test_book(user_id, "Book Two", "Author Two")
        .await;

    // Create journal entries for both books
    let journal1_data = json!({
        "title": "Journal for Book 1",
        "content": "Thoughts about book one."
    });

    let journal2_data = json!({
        "title": "Journal for Book 2",
        "content": "Thoughts about book two."
    });

    let (status1, _) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book1_id),
        user_id,
        Some(journal1_data),
    )
    .await;
    assert_eq!(status1, StatusCode::OK);

    let (status2, _) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book2_id),
        user_id,
        Some(journal2_data),
    )
    .await;
    assert_eq!(status2, StatusCode::OK);

    // Get all journals
    let (status, body) = make_request(&test_app, "GET", "/journals", user_id, None).await;

    assert_eq!(status, StatusCode::OK);

    let journals_array = body.as_array().unwrap();
    assert_eq!(journals_array.len(), 2);

    // Verify both journals are returned
    let book1_journal = journals_array
        .iter()
        .find(|j| j["book_id"] == book1_id)
        .unwrap();
    let book2_journal = journals_array
        .iter()
        .find(|j| j["book_id"] == book2_id)
        .unwrap();

    assert_eq!(book1_journal["title"], "Journal for Book 1");
    assert_eq!(book1_journal["content"], "Thoughts about book one.");

    assert_eq!(book2_journal["title"], "Journal for Book 2");
    assert_eq!(book2_journal["content"], "Thoughts about book two.");
}

#[tokio::test]
async fn test_get_journal_by_id_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a book and journal entry
    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    let journal_data = json!({
        "title": "Test Journal",
        "content": "Test content for journal."
    });

    let (status, body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(journal_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let journal_id = body["id"].as_i64().unwrap();

    // Get the journal by ID
    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/journals/{}", journal_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(body.is_object());

    let journal = body.as_object().unwrap();
    assert_eq!(journal["id"], journal_id);
    assert_eq!(journal["title"], "Test Journal");
    assert_eq!(journal["content"], "Test content for journal.");
    assert_eq!(journal["book_id"], book_id);
    assert_eq!(journal["user_id"], user_id);
}

#[tokio::test]
async fn test_get_book_journals_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with non-numeric book ID
    let (status, _body) = make_request(
        &test_app,
        "GET",
        "/books/not_a_number/journals",
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_book_journal_bad_request_invalid_book_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let journal_data = json!({
        "title": "Test Journal",
        "content": "Test content."
    });

    // Test with non-numeric book ID
    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/books/not_a_number/journals",
        user_id,
        Some(journal_data),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_get_journal_by_id_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with non-numeric journal ID
    let (status, _body) =
        make_request(&test_app, "GET", "/journals/not_a_number", user_id, None).await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

// Validation and Bad Request Tests

#[tokio::test]
async fn test_create_book_journal_validation_missing_title() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Test missing title
    let invalid_data = json!({
        "content": "Test content without title."
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(invalid_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_journal_validation_missing_content() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Test missing content
    let invalid_data = json!({
        "title": "Test Journal"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(invalid_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_journal_bad_request_empty_json() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Test with empty JSON object
    let empty_data = json!({});

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(empty_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_journal_bad_request_invalid_json_field() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Test with invalid data type for required field
    let invalid_data = json!({
        "title": 123,  // title should be a string
        "content": "Test content"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        &format!("/books/{}/journals", book_id),
        user_id,
        Some(invalid_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_book_journal_bad_request_malformed_json_syntax() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let book_id = test_app
        .create_test_book(user_id, "Test Book", "Test Author")
        .await;

    // Create a request with invalid JSON syntax manually
    use axum::{body::Body, extract::Request};
    use tower::ServiceExt;

    let request = Request::builder()
        .method("POST")
        .uri(&format!("/books/{}/journals", book_id))
        .header("currentUserId", user_id.to_string())
        .header("content-type", "application/json")
        .body(Body::from(
            "{\"title\": \"Test\", \"content\": \"Test\" invalid JSON}",
        ))
        .unwrap();

    let response = test_app.app.clone().oneshot(request).await.unwrap();
    let status = response.status();

    // Malformed JSON syntax should return BAD_REQUEST
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
