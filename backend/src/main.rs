use tracing::{debug, info};

mod app;
mod db;
mod models;
mod routes;
mod utils;

use crate::app::app;
use crate::db::init_db;

#[tokio::main]
async fn main() {
    // Load .env file from project root (parent directory)
    if let Err(e) = dotenvy::from_filename("../.env") {
        debug!("Could not load .env file from parent directory: {}", e);
        // Try current directory as fallback
        if let Err(e2) = dotenvy::dotenv() {
            debug!("Could not load .env file from current directory: {}", e2);
        }
    }

    // Initialize tracing subscriber for logging
    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "backend=debug,sqlx=info".to_string()),
        )
        .init();

    info!("Starting backend server...");

    debug!("Initializing database connection pool");
    let pool = init_db().await;
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
