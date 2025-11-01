#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct Rating {
    pub id: i64,
    pub user_id: i64,
    pub book_id: i64,
    pub rating: Option<f64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
