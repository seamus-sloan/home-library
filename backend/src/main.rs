use axum::extract::State;
use axum::{
    Json, Router,
    routing::{get, post},
};
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
}

#[derive(serde_derive::Serialize)]
struct JournalEntry {
    id: i64,
    book_id: i64,
    title: String,
    content: String,
    date: String,
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
        .route("/books", post(create_book))
        .route("/books", get(get_books))
        .route("/books/{id}", get(get_books))
        .route("/journals", get(get_journals))
        .route("/journals/{id}", get(get_journals))
        .with_state(pool)
}

async fn create_book(State(pool): State<Pool<Sqlite>>, Json(book): Json<Book>) -> Json<Book> {
    info!("Creating new book: {}", book.title);
    debug!(
        "Book details - Author: {}, Genre: {}, Rating: {:?}",
        book.author, book.genre, book.rating
    );

    match database::create_book(&pool, book).await {
        Ok(created_book) => {
            info!("Successfully created book with ID: {}", created_book.id);
            Json(created_book)
        }
        Err(e) => {
            error!("Failed to create book: {}", e);
            panic!("Failed to create book")
        }
    }
}

async fn get_books(State(pool): State<Pool<Sqlite>>) -> Json<Vec<Book>> {
    debug!("Fetching all books from database");

    match database::get_all_books(&pool).await {
        Ok(books) => {
            info!("Successfully retrieved {} books", books.len());
            debug!(
                "Books retrieved: {:?}",
                books.iter().map(|b| &b.title).collect::<Vec<_>>()
            );
            Json(books)
        }
        Err(e) => {
            error!("Failed to fetch books: {}", e);
            warn!("Returning empty book list due to database error");
            Json(vec![])
        }
    }
}

async fn get_journals(State(pool): State<Pool<Sqlite>>) -> Json<Vec<JournalEntry>> {
    debug!("Fetching all journal entries from database");

    match database::get_all_journals(&pool).await {
        Ok(journals) => {
            info!("Successfully retrieved {} journal entries", journals.len());
            debug!(
                "Journal entries retrieved: {:?}",
                journals.iter().map(|j| &j.title).collect::<Vec<_>>()
            );
            Json(journals)
        }
        Err(e) => {
            error!("Failed to fetch journal entries: {}", e);
            warn!("Returning empty journal list due to database error");
            Json(vec![])
        }
    }
}
