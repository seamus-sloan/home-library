use serde::{Deserialize, Deserializer};

// Custom deserializer to handle Option<Option<T>> properly
fn deserialize_double_option<'de, T, D>(deserializer: D) -> Result<Option<Option<T>>, D::Error>
where
    T: Deserialize<'de>,
    D: Deserializer<'de>,
{
    Ok(Some(Option::deserialize(deserializer)?))
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct Book {
    #[serde(skip_deserializing)]
    pub id: i64,
    #[serde(skip_deserializing)]
    pub user_id: i64,
    pub cover_image: Option<String>,
    pub title: String,
    pub author: String,
    pub series: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct CreateBookRequest {
    pub cover_image: Option<String>,
    pub title: String,
    pub author: String,
    pub tags: Option<Vec<i64>>,
    pub genres: Option<Vec<i64>>,
    pub series: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct UpdateBookRequest {
    pub cover_image: Option<String>,
    pub title: Option<String>,
    pub author: Option<String>,
    pub tags: Option<Vec<i64>>,
    pub genres: Option<Vec<i64>>,
    pub series: Option<String>,
}

#[derive(serde_derive::Serialize)]
pub struct BookTag {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize)]
pub struct BookGenre {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize)]
pub struct JournalUser {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize)]
pub struct BookJournal {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub user: JournalUser,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(serde_derive::Serialize)]
pub struct RatingUser {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize)]
pub struct BookRating {
    pub id: i64,
    pub user_id: i64,
    pub book_id: i64,
    pub rating: f64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub user: RatingUser,
}

#[derive(serde_derive::Serialize)]
pub struct StatusUser {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize)]
pub struct BookStatus {
    pub id: i64,
    pub user_id: i64,
    pub book_id: i64,
    pub status_id: i64,
    pub status_name: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub user: StatusUser,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct UpsertStatusRequest {
    pub status_id: i64,
}

#[derive(serde_derive::Serialize)]
pub struct BookWithDetails {
    pub id: i64,
    pub user_id: i64,
    pub cover_image: Option<String>,
    pub title: String,
    pub author: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub tags: Vec<BookTag>,
    pub genres: Vec<BookGenre>,
    pub series: Option<String>,
    pub journals: Vec<BookJournal>,
    pub ratings: Vec<BookRating>,
    pub statuses: Vec<BookStatus>,
    pub current_user_status: Option<i64>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct Genre {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub color: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct CreateGenreRequest {
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct UpdateGenreRequest {
    pub name: Option<String>,
    pub color: Option<String>,
}
