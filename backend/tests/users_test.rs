mod common;
mod utils;

use axum::http::StatusCode;
use common::TestApp;
use serde_json::json;
use utils::make_request;

#[tokio::test]
async fn test_get_users_empty() {
    let test_app = TestApp::new().await;

    let (status, body) = make_request(&test_app, "GET", "/users", 1, None).await;

    assert_eq!(status, StatusCode::OK);
    // Database might have pre-existing users, just check it's an array
    assert!(body.is_array());
}

#[tokio::test]
async fn test_get_users_with_data() {
    let test_app = TestApp::new().await;

    // Create multiple users
    let user1_id = test_app.create_test_user().await;
    let user2_id = test_app.create_test_user().await;

    let (status, body) = make_request(&test_app, "GET", "/users", user1_id, None).await;

    assert_eq!(status, StatusCode::OK);

    let users_array = body.as_array().unwrap();
    // Database might have pre-existing users, so we check >= 2
    assert!(users_array.len() >= 2);

    // Find the users in the response
    let user1 = users_array.iter().find(|u| u["id"] == user1_id).unwrap();
    let user2 = users_array.iter().find(|u| u["id"] == user2_id).unwrap();

    assert_eq!(user1["name"], "Test User");
    assert_eq!(user2["name"], "Test User");
    assert!(user1["color"].is_string());
    assert!(user2["color"].is_string());
}

#[tokio::test]
async fn test_select_user_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Get the user first to check initial last_login
    let (status, body) = make_request(&test_app, "GET", "/users", user_id, None).await;
    assert_eq!(status, StatusCode::OK);

    let users = body.as_array().unwrap();
    let user = users.iter().find(|u| u["id"] == user_id).unwrap();
    let initial_last_login = user["last_login"].clone();

    // Wait a moment to ensure timestamp difference
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

    // Select the user
    let select_data = json!({
        "id": user_id
    });

    let (status, body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(select_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["id"], user_id);
    assert_eq!(body["name"], "Test User");
    assert!(body["color"].is_string());

    // Check that last_login was updated
    let updated_last_login = body["last_login"].clone();
    assert_ne!(initial_last_login, updated_last_login);
    assert!(updated_last_login.is_string());
}

#[tokio::test]
async fn test_select_user_updates_last_login() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Select the user first time
    let select_data = json!({
        "id": user_id
    });

    let (status, body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(select_data.clone()),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let first_last_login = body["last_login"].clone();

    // Wait a moment to ensure timestamp difference
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

    // Select the user second time
    let (status, body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(select_data),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let second_last_login = body["last_login"].clone();

    // Verify last_login was updated
    assert_ne!(first_last_login, second_last_login);
    assert!(second_last_login.is_string());
}

#[tokio::test]
async fn test_select_user_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let select_data = json!({
        "id": 99999  // Non-existent user ID
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(select_data),
    )
    .await;

    assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
}

// Validation and Bad Request Tests

#[tokio::test]
async fn test_select_user_validation_missing_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test missing id field
    let invalid_data = json!({});

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(invalid_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_select_user_bad_request_invalid_json_field() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with invalid data type for id field
    let invalid_data = json!({
        "id": "not_a_number"
    });

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(invalid_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_select_user_bad_request_empty_json() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with empty JSON object
    let empty_data = json!({});

    let (status, _body) = make_request(
        &test_app,
        "POST",
        "/users/select",
        user_id,
        Some(empty_data),
    )
    .await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_select_user_bad_request_malformed_json_syntax() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a request with invalid JSON syntax manually
    use axum::{body::Body, extract::Request};
    use tower::ServiceExt;

    let request = Request::builder()
        .method("POST")
        .uri("/users/select")
        .header("currentUserId", user_id.to_string())
        .header("content-type", "application/json")
        .body(Body::from("{\"id\": 123 invalid JSON}"))
        .unwrap();

    let response = test_app.app.clone().oneshot(request).await.unwrap();
    let status = response.status();

    // Malformed JSON syntax should return BAD_REQUEST
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
