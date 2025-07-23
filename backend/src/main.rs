use axum::extract::State;
use axum::{
    Json, Router,
    routing::{get, post},
};
use reqwest::StatusCode;
use sqlx::{Pool, Sqlite};
use tracing::{debug, error, info, warn};

mod database;

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
struct Book {
    #[serde(skip_deserializing)]
    id: i64,
    cover_image: Option<String>,
    title: String,
    author: String,
    genre: String,
    rating: Option<f64>,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize, Debug)]
struct JournalEntry {
    #[serde(skip_deserializing)]
    id: i64,
    #[serde(skip_deserializing)]
    book_id: i64,
    title: String,
    content: String,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[derive(serde_derive::Serialize, serde_derive::Deserialize)]
struct User {
    id: i64,
    name: String,
    avatar_color: String,
    created_at: Option<String>,
    updated_at: Option<String>,
    last_login: Option<String>,
}

#[tokio::main]
async fn main() {
    // Initialize tracing subscriber for logging
    tracing_subscriber::fmt()
        .with_env_filter("backend=debug,sqlx=info")
        .init();

    info!("Starting backend server...");

    debug!("Initializing database connection pool");
    let pool = database::init_db().await;
    info!("Database initialized successfully");

    debug!("Building application router");
    let app = app(pool).await;
    info!("Application router configured");

    debug!("Binding to address 0.0.0.0:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    info!("Server listening on {}", listener.local_addr().unwrap());

    debug!("Starting axum server");
    axum::serve(listener, app).await.unwrap();
}

async fn app(pool: Pool<Sqlite>) -> Router {
    debug!("Creating router with routes");
    Router::new()
        .route("/users", get(get_users))
        .route("/books", post(create_book))
        .route("/books", get(get_books))
        .route("/books/{id}", get(get_single_book))
        .route("/books/{id}/journals", get(get_book_journals))
        .route("/books/{id}/journals", post(create_book_journal_entry))
        .route("/journals", get(get_journals))
        .route("/journals/{id}", get(get_single_journal))
        .with_state(pool)
}

async fn get_users(State(pool): State<Pool<Sqlite>>) -> Result<Json<Vec<User>>, StatusCode> {
    debug!("Fetching all users from database");

    match database::get_all_users(&pool).await {
        Ok(users) => {
            info!("Successfully retrieved {} users", users.len());
            Ok(Json(users))
        }
        Err(e) => {
            error!("Failed to fetch users: {}", e);
            warn!("Returning empty user list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn create_book(
    State(pool): State<Pool<Sqlite>>,
    Json(book): Json<Book>,
) -> Result<Json<Book>, StatusCode> {
    if book.title.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    if book.author.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    info!("Creating new book: {}", book.title);
    debug!(
        "Book details - Author: {}, Genre: {}, Rating: {:?}",
        book.author, book.genre, book.rating
    );

    match database::create_book(&pool, book).await {
        Ok(created_book) => {
            info!("Successfully created book with ID: {}", created_book.id);

            match &created_book.cover_image {
                Some(cover) if !cover.is_empty() => {
                    debug!("Cover image provided. Skipping default book cover.");
                }
                _ => {
                    debug!("No cover image provided for book");
                    if let Err(e) = database::set_default_book_cover(&pool, &created_book).await {
                        warn!("Failed to set default book cover: {}", e);
                        // Continue without failing the entire request
                    }
                }
            }

            // Even if we fail to fetch a cover via external api, we still create a book so we return success.
            Ok(Json(created_book))
        }
        Err(e) => {
            error!("Failed to create book: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_books(State(pool): State<Pool<Sqlite>>) -> Result<Json<Vec<Book>>, StatusCode> {
    debug!("Fetching all books from database");

    match database::get_all_books(&pool).await {
        Ok(books) => {
            info!("Successfully retrieved {} books", books.len());
            debug!(
                "Books retrieved: {:?}",
                books.iter().map(|b| &b.title).collect::<Vec<_>>()
            );
            Ok(Json(books))
        }
        Err(e) => {
            error!("Failed to fetch books: {}", e);
            warn!("Returning empty book list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_single_book(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<Json<Option<Book>>, StatusCode> {
    debug!("Fetching book with ID: {}", id);

    match database::get_book_by_id(&pool, id).await {
        Ok(Some(book)) => {
            info!("Found book with ID {}: '{}'", id, book.title);
            Ok(Json(Some(book)))
        }
        Ok(None) => {
            warn!("No book found with ID: {}", id);
            Ok(Json(None))
        }
        Err(e) => {
            error!("Failed to fetch book by ID {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_book_journals(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<Json<Vec<JournalEntry>>, StatusCode> {
    debug!("Fetching journals for book with ID: {}", id);

    match database::get_journals_by_book_id(&pool, id).await {
        Ok(journals) => {
            info!("Found {} journals for book ID {}", journals.len(), id);
            Ok(Json(journals))
        }
        Err(e) => {
            error!("Failed to fetch journals for book ID {}: {}", id, e);
            warn!("Returning empty journal list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn create_book_journal_entry(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(book_id): axum::extract::Path<i64>,
    Json(mut journal): Json<JournalEntry>,
) -> Result<Json<JournalEntry>, StatusCode> {
    debug!("Creating journal for book ID: {}", book_id);

    // Set the book_id from the path parameter
    journal.book_id = book_id;

    info!(
        "Journal details - Title: '{}', Content: '{}'",
        journal.title, journal.content
    );

    match database::create_journal_entry(&pool, journal).await {
        Ok(created_journal) => {
            info!(
                "Successfully created journal with ID: {}",
                created_journal.id
            );
            Ok(Json(created_journal))
        }
        Err(e) => {
            error!("Failed to create journal: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_journals(
    State(pool): State<Pool<Sqlite>>,
) -> Result<Json<Vec<JournalEntry>>, StatusCode> {
    debug!("Fetching all journal entries from database");

    match database::get_all_journals(&pool).await {
        Ok(journals) => {
            info!("Successfully retrieved {} journal entries", journals.len());
            debug!(
                "Journal entries retrieved: {:?}",
                journals.iter().map(|j| &j.title).collect::<Vec<_>>()
            );
            Ok(Json(journals))
        }
        Err(e) => {
            error!("Failed to fetch journal entries: {}", e);
            warn!("Returning empty journal list due to database error");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_single_journal(
    State(pool): State<Pool<Sqlite>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<Json<Option<JournalEntry>>, StatusCode> {
    debug!("Fetching journal entry with ID: {}", id);

    match database::get_journal_by_id(&pool, id).await {
        Ok(Some(journal)) => {
            info!("Found journal entry with ID {}: '{}'", id, journal.title);
            Ok(Json(Some(journal)))
        }
        Ok(None) => {
            warn!("No journal entry found with ID: {}", id);
            Ok(Json(None))
        }
        Err(e) => {
            error!("Failed to fetch journal entry by ID {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
