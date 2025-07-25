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
