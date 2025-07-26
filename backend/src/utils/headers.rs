use axum::http::HeaderMap;
use reqwest::StatusCode;
use tracing::error;

/// Extracts the user_id from the "currentUserId" header
///
/// # Arguments
/// * `headers` - The HTTP headers from the request
///
/// # Returns
/// * `Ok(i64)` - The parsed user ID
/// * `Err(StatusCode)` - BAD_REQUEST if header is missing, invalid UTF-8, or not a valid i64
pub fn extract_user_id_from_headers(headers: &HeaderMap) -> Result<i64, StatusCode> {
    let user_id = match headers.get("currentUserId") {
        Some(header_value) => match header_value.to_str() {
            Ok(id_str) => match id_str.parse::<i64>() {
                Ok(id) => id,
                Err(_) => {
                    error!("Invalid currentUserId header format: {}", id_str);
                    return Err(StatusCode::BAD_REQUEST);
                }
            },
            Err(_) => {
                error!("currentUserId header contains invalid UTF-8");
                return Err(StatusCode::BAD_REQUEST);
            }
        },
        None => {
            error!("Missing currentUserId header");
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    Ok(user_id)
}
