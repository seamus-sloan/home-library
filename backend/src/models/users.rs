#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub avatar_color: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub last_login: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct SelectUser {
    pub id: i64,
}
