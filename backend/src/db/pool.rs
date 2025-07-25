use sqlx::{Pool, Sqlite};
use tracing::{debug, info};

const DATABASE_FILE: &str = "development.db";

pub async fn init_db() -> Pool<Sqlite> {
    debug!("Initializing SQLite database connection");

    let opt = sqlx::sqlite::SqliteConnectOptions::new()
        .filename(DATABASE_FILE)
        .create_if_missing(true);

    debug!("Connecting to SQLite database: {}", DATABASE_FILE);
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
