mod common;
mod utils;

use axum::http::StatusCode;
use common::TestApp;
use serde_json::json;
use utils::make_request;

#[tokio::test]
async fn test_get_genres_empty() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, body) = make_request(&test_app, "GET", "/genres", user_id, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body, json!([]));
}

#[tokio::test]
async fn test_create_genre_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let genre_data = json!({
        "user_id": user_id,
        "name": "Science Fiction",
        "color": "#0066cc"
    });

    let (status, body) =
        make_request(&test_app, "POST", "/genres", user_id, Some(genre_data)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["name"], "Science Fiction");
    assert_eq!(body["color"], "#0066cc");
    assert_eq!(body["user_id"], user_id);
    assert!(body["id"].as_i64().unwrap() > 0);
}

#[tokio::test]
async fn test_get_genre_by_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a genre directly in the database
    let genre_id = test_app
        .create_test_genre(user_id, "Fantasy", "#9966cc")
        .await;

    let (status, body) = make_request(
        &test_app,
        "GET",
        &format!("/genres/{}", genre_id),
        user_id,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["id"], genre_id);
    assert_eq!(body["name"], "Fantasy");
    assert_eq!(body["color"], "#9966cc");
    assert_eq!(body["user_id"], user_id);
}

#[tokio::test]
async fn test_get_genre_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let (status, _body) = make_request(&test_app, "GET", "/genres/99999", user_id, None).await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_update_genre_basic() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a genre
    let genre_id = test_app
        .create_test_genre(user_id, "Original Genre", "#ff0000")
        .await;

    let update_data = json!({
        "name": "Updated Genre",
        "color": "#00ff00"
    });

    let (status, body) = make_request(
        &test_app,
        "PUT",
        &format!("/genres/{}", genre_id),
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["name"], "Updated Genre");
    assert_eq!(body["color"], "#00ff00");
}

#[tokio::test]
async fn test_get_genres_with_data() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create multiple genres
    let genre1_id = test_app
        .create_test_genre(user_id, "Mystery", "#333333")
        .await;
    let genre2_id = test_app
        .create_test_genre(user_id, "Romance", "#ff69b4")
        .await;

    let (status, body) = make_request(&test_app, "GET", "/genres", user_id, None).await;

    assert_eq!(status, StatusCode::OK);

    let genres_array = body.as_array().unwrap();
    assert_eq!(genres_array.len(), 2);

    // Find the genres in the response
    let genre1 = genres_array.iter().find(|g| g["id"] == genre1_id).unwrap();
    let genre2 = genres_array.iter().find(|g| g["id"] == genre2_id).unwrap();

    assert_eq!(genre1["name"], "Mystery");
    assert_eq!(genre1["color"], "#333333");

    assert_eq!(genre2["name"], "Romance");
    assert_eq!(genre2["color"], "#ff69b4");
}

#[tokio::test]
async fn test_update_genre_not_found() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let update_data = json!({
        "name": "Updated Genre"
    });

    let (status, _body) = make_request(
        &test_app,
        "PUT",
        "/genres/99999",
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

// Validation and Bad Request Tests

#[tokio::test]
async fn test_create_genre_validation_missing_name() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test missing name
    let invalid_data = json!({
        "user_id": user_id,
        "color": "#ff0000"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/genres", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_genre_validation_missing_color() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test missing color
    let invalid_data = json!({
        "user_id": user_id,
        "name": "Test Genre"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/genres", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_genre_bad_request_empty_json() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with empty JSON object
    let empty_data = json!({});

    let (status, _body) =
        make_request(&test_app, "POST", "/genres", user_id, Some(empty_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_create_genre_bad_request_invalid_json_field() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with invalid data type for required field
    let invalid_data = json!({
        "name": 123,  // name should be a string
        "color": "#ff0000"
    });

    let (status, _body) =
        make_request(&test_app, "POST", "/genres", user_id, Some(invalid_data)).await;

    assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_get_genre_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Test with non-numeric genre ID
    let (status, _body) =
        make_request(&test_app, "GET", "/genres/not_a_number", user_id, None).await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_update_genre_bad_request_invalid_id() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    let update_data = json!({
        "name": "Updated Genre"
    });

    // Test with non-numeric genre ID
    let (status, _body) = make_request(
        &test_app,
        "PUT",
        "/genres/not_a_number",
        user_id,
        Some(update_data),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_create_genre_bad_request_malformed_json_syntax() {
    let test_app = TestApp::new().await;
    let user_id = test_app.create_test_user().await;

    // Create a request with invalid JSON syntax manually
    use axum::{body::Body, extract::Request};
    use tower::ServiceExt;

    let request = Request::builder()
        .method("POST")
        .uri("/genres")
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
