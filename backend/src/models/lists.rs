use serde::{Deserialize, Serialize};

// Basic List structure from database
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct List {
    #[serde(skip_deserializing)]
    pub id: i64,
    #[serde(skip_deserializing)]
    pub user_id: i64,
    pub type_id: i64,
    pub name: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

// Book info to include in list responses
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BookInList {
    pub id: i64,
    pub cover_image: Option<String>,
    pub status_name: Option<String>,
}

// User info to include in list responses
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ListUser {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub avatar_image: Option<String>,
}

// List with books for GET responses
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ListWithBooks {
    pub id: i64,
    pub user_id: i64,
    pub type_id: i64,
    pub name: String,
    pub books: Vec<BookInList>,
    pub user: ListUser,
}

// Request body for creating a list
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateListRequest {
    pub type_id: i64,
    pub name: String,
    pub books: Vec<i64>, // Array of book IDs
}

// Request body for updating a list
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateListRequest {
    pub name: Option<String>,
    pub type_id: Option<i64>,
    pub books: Option<Vec<i64>>, // Array of book IDs
}
