use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::path::Path;
use std::process::Command;
use std::{env, fs};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load .env file from project root (parent directory)
    dotenvy::from_filename("../.env")
        .or_else(|_| dotenvy::dotenv())
        .ok();

    println!("🗑️  Resetting E2E database...");

    // Get database file path - default to E2E database
    let db_file = env::var("DATABASE_FILE").unwrap_or_else(|_| "data/library-e2e.db".to_string());
    println!("  - Database file: {db_file}");

    // Remove existing database if it exists
    if Path::new(&db_file).exists() {
        println!("  - Removing existing database");
        fs::remove_file(&db_file)?;
    }

    // Ensure data directory exists
    if let Some(parent) = Path::new(&db_file).parent() {
        fs::create_dir_all(parent)?;
    }

    // Create database and run migrations
    println!("  - Running migrations");
    let opt = SqliteConnectOptions::new()
        .filename(&db_file)
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(opt).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    // Close the connection pool before using sqlite3 command
    pool.close().await;

    // Seed the database using sqlite3 command-line tool
    println!("  - Seeding database with test data");
    let output = Command::new("sqlite3")
        .arg(&db_file)
        .stdin(fs::File::open("e2e-seed.sql")?)
        .output()?;

    if !output.status.success() {
        return Err(format!(
            "Failed to seed database: {}",
            String::from_utf8_lossy(&output.stderr)
        )
        .into());
    }

    println!("✅ Database reset complete!\n");

    Ok(())
}
