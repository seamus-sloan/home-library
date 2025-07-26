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
    // Initialize tracing subscriber for logging
    tracing_subscriber::fmt()
        .with_env_filter("backend=debug,sqlx=info")
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
