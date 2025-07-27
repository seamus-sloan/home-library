mod common;
mod utils;

use axum::http::StatusCode;
use common::TestApp;
use serde_json::json;
use utils::make_request;

#[tokio::test]
async fn test_get_tags_empty() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, body) = make_request(&test_app, "GET", "/tags", user_id, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body, json!([]));
}

#[tokio::test]
async fn test_create_tag_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let tag_data = json!({
        "user_id": user_id,
        "name": "Fiction",
        "color": "#ff0000"
    });

    let (status, body) = make_request(&test_app, "POST", "/tags", user_id, Some(tag_data)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["name"], "Fiction");
    assert_eq!(body["color"], "#ff0000");
    assert_eq!(body["user_id"], user_id);
    assert!(body["id"].as_i64().unwrap() > 0);
}

#[tokio::test]
async fn test_get_tag_by_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a tag directly in the database
    let tag_id = test_app
        .create_test_tag(user_id, "Test Tag", "#00ff00")
        .await;

    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/tags/{}", tag_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["id"], tag_id);
    assert_eq!(body["name"], "Test Tag");
    assert_eq!(body["color"], "#00ff00");
    assert_eq!(body["user_id"], user_id);
}

#[tokio::test]
async fn test_get_tag_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, _body) = make_request(&test_app, "GET", "/tags/99999", user_id, None).await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_update_tag_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a tag
    let tag_id = test_app
        .create_test_tag(user_id, "Original Tag", "#ff0000")
        .await;

    let update_data = json!({
        "name": "Updated Tag",
        "color": "#00ff00"
    });

    let (status, body) = make_request(
        &test_app,
        "PUT",
        &format!("/tags/{}", tag_id),
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["name"], "Updated Tag");
    assert_eq!(body["color"], "#00ff00");
}

#[tokio::test]
async fn test_get_tags_with_data() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create multiple tags
    let tag1_id = test_app
        .create_test_tag(user_id, "Fiction", "#ff0000")
        .await;
    let tag2_id = test_app
        .create_test_tag(user_id, "Non-Fiction", "#00ff00")
        .await;

    let (status, body) = make_request(&test_app, "GET", "/tags", user_id, None).await;

    assert_eq!(status, StatusCode::OK);

    let tags_array = body.as_array().unwrap();
    assert_eq!(tags_array.len(), 2);

    // Find the tags in the response
    let tag1 = tags_array.iter().find(|t| t["id"] == tag1_id).unwrap();
    let tag2 = tags_array.iter().find(|t| t["id"] == tag2_id).unwrap();

    assert_eq!(tag1["name"], "Fiction");
    assert_eq!(tag1["color"], "#ff0000");

    assert_eq!(tag2["name"], "Non-Fiction");
    assert_eq!(tag2["color"], "#00ff00");
}

#[tokio::test]
async fn test_update_tag_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let update_data = json!({
        "name": "Updated Tag",
        "color": "#00ff00"
    });

    let (status, _body) =
        make_request(&test_app, "PUT", "/tags/99999", user_id, Some(update_data)).await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

// Validation and Bad Request Tests

#[tokio::test]
async fn test_create_tag_validation_missing_name() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test missing name
    let invalid_data = json!({
        "user_id": user_id,
        "color": "#ff0000"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/tags", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_tag_validation_missing_color() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test missing color
    let invalid_data = json!({
        "user_id": user_id,
        "name": "Test Tag"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/tags", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_tag_bad_request_empty_json() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with empty JSON object
    let empty_data = json!({});

    let (status, _body) = make_request(&test_app, "POST", "/tags", user_id, Some(empty_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_tag_bad_request_invalid_json_field() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with invalid data type for required field
    let invalid_data = json!({
        "name": 123,  // name should be a string
        "color": "#ff0000"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/tags", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_get_tag_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with non-numeric tag ID
    let (status, _body) = make_request(&test_app, "GET", "/tags/not_a_number", user_id, None).await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_update_tag_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let update_data = json!({
        "name": "Updated Tag"
    });

    // Test with non-numeric tag ID
    let (status, _body) = make_request(
        &test_app,
        "PUT",
        "/tags/not_a_number",
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_tag_bad_request_malformed_json_syntax() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a request with invalid JSON syntax manually
    use axum::{body::Body, extract::Request};
    use tower::ServiceExt;

    let request = Request::builder()
        .method("POST")
        .uri("/tags")
        .header("currentUserId", user_id.to_string())
        .header("content-type", "application/json")
        .body(Body::from(
            "{\"name\": \"Test\", \"color\": \"#ff0000\" invalid JSON}",
        ))
        .unwrap();

    let response = test_app.app.clone().oneshot(request).await.unwrap();
    let status = response.status();

    // Malformed JSON syntax should return BAD_REQUEST
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
