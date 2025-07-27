use axum::{body::Body, extract::Request, http::StatusCode};
use http_body_util::BodyExt;
use serde_json;
use tower::ServiceExt;

use crate::common::TestApp;

pub async fn make_request(
    app: &TestApp,
    method: &str,
    uri: &str,
    user_id: i64,
    body: Option<serde_json::Value>,
) -> (StatusCode, serde_json::Value) {
    let request_builder = Request::builder()
        .method(method)
        .uri(uri)
        .header("currentUserId", user_id.to_string())
        .header("content-type", "application/json");

    let request = if let Some(body) = body {
        request_builder
            .body(Body::from(serde_json::to_string(&body).unwrap()))
            .unwrap()
    } else {
        request_builder.body(Body::empty()).unwrap()
    };

    let response = app.app.clone().oneshot(request).await.unwrap();
    let status = response.status();

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_text = String::from_utf8(body_bytes.to_vec()).unwrap();

    let json_body = if body_text.is_empty() {
        serde_json::Value::Null
    } else {
        serde_json::from_str(&body_text).unwrap_or(serde_json::Value::String(body_text))
    };

    (status, json_body)
}
