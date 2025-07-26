#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct Tag {
    #[serde(skip_deserializing)]
    pub id: i64,
    #[serde(skip_deserializing)]
    pub user_id: i64,
    pub name: String,
    pub color: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
