#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub avatar_image: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub last_login: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct SelectUser {
    pub id: i64,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
    pub color: Option<String>,
    pub avatar_image: Option<String>,
}
