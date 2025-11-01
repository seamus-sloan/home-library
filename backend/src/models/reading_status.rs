#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct ReadingStatus {
    pub id: i64,
    pub user_id: i64,
    pub book_id: i64,
    pub status_id: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
