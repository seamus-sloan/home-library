use sqlx::{Pool, Sqlite};
use std::env;
use tracing::{debug, info};

pub async fn init_db() -> Pool<Sqlite> {
    debug!("Initializing SQLite database connection");

    // Get database file path from environment variable or use default
    let database_file = env::var("DATABASE_FILE").unwrap_or_else(|_| {
        info!("DATABASE_FILE not set, using default: data/development.db");
        "data/development.db".to_string()
    });
    info!("📂 Using database file: {}", database_file);

    let opt = sqlx::sqlite::SqliteConnectOptions::new()
        .filename(&database_file)
        .create_if_missing(true);

    debug!("Connecting to SQLite database: {}", database_file);
    let pool = sqlx::sqlite::SqlitePool::connect_with(opt).await.unwrap();
    info!("Successfully connected to SQLite database");

    debug!("Running database migrations");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");
    info!("Database migrations completed successfully");

    pool
}
