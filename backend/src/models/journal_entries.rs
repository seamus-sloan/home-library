#[derive(serde_derive::Serialize, serde_derive::Deserialize, Debug)]
pub struct JournalEntry {
    #[serde(skip_deserializing)]
    pub id: i64,
    #[serde(skip_deserializing)]
    pub book_id: i64,
    #[serde(skip_deserializing)]
    pub user_id: i64,
    pub title: String,
    pub content: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct UpdateJournalRequest {
    pub title: Option<String>,
    pub content: Option<String>,
}
