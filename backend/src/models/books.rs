#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct Book {
    #[serde(skip_deserializing)]
    pub id: i64,
    #[serde(skip_deserializing)]
    pub user_id: i64,
    pub cover_image: Option<String>,
    pub title: String,
    pub author: String,
    pub genre: String,
    pub rating: Option<f64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct CreateBookRequest {
    pub cover_image: Option<String>,
    pub title: String,
    pub author: String,
    pub genre: String,
    pub rating: Option<f64>,
    pub tags: Option<Vec<i64>>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct UpdateBookRequest {
    pub cover_image: Option<String>,
    pub title: Option<String>,
    pub author: Option<String>,
    pub genre: Option<String>,
    pub rating: Option<Option<f64>>, // Option<Option<f64>> to handle explicit null values
    pub tags: Option<Vec<i64>>,
}

#[derive(serde_derive::Serialize)]
pub struct BookTag {
    pub id: i64,
    pub name: String,
    pub color: String,
}

#[derive(serde_derive::Serialize)]
pub struct JournalUser {
    pub id: i64,
    pub name: String,
    pub avatar_color: String,
}

#[derive(serde_derive::Serialize)]
pub struct BookJournal {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub user: JournalUser,
    pub created_at: String,
}

#[derive(serde_derive::Serialize)]
pub struct BookWithDetails {
    pub id: i64,
    pub user_id: i64,
    pub cover_image: Option<String>,
    pub title: String,
    pub author: String,
    pub genre: String,
    pub rating: Option<f64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub tags: Vec<BookTag>,
    pub journals: Vec<BookJournal>,
}
