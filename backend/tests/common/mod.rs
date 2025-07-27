use axum::Router;
use sqlx::{Sqlite, SqlitePool, migrate::MigrateDatabase};
use tempfile::TempDir;

pub struct TestApp {
    pub pool: SqlitePool,
    pub app: Router,
    pub _temp_dir: TempDir,
}

impl TestApp {
    pub async fn new() -> Self {
        // Create a temporary directory for the test database
        let temp_dir = tempfile::tempdir().expect("Failed to create temp dir");
        let db_path = temp_dir.path().join("test.db");
        let database_url = format!("sqlite://{}", db_path.display());

        // Create and migrate the database
        if !Sqlite::database_exists(&database_url)
            .await
            .unwrap_or(false)
        {
            Sqlite::create_database(&database_url).await.unwrap();
        }

        let pool = SqlitePool::connect(&database_url).await.unwrap();

        // Run migrations
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .expect("Failed to migrate test database");

        // Create the app
        let app = backend::app::app(pool.clone()).await;

        Self {
            pool,
            app,
            _temp_dir: temp_dir,
        }
    }

    pub async fn create_test_user(&self) -> i64 {
        let result = sqlx::query_as::<_, (i64,)>(
            "INSERT INTO users (name, color) VALUES (?, ?) RETURNING id",
        )
        .bind("Test User")
        .bind("bg-blue-500")
        .fetch_one(&self.pool)
        .await
        .unwrap();

        result.0
    }

    pub async fn create_test_tag(&self, user_id: i64, name: &str, color: &str) -> i64 {
        let result = sqlx::query_as::<_, (i64,)>(
            "INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?) RETURNING id",
        )
        .bind(user_id)
        .bind(name)
        .bind(color)
        .fetch_one(&self.pool)
        .await
        .unwrap();

        result.0
    }

    pub async fn create_test_genre(&self, user_id: i64, name: &str, color: &str) -> i64 {
        let result = sqlx::query_as::<_, (i64,)>(
            "INSERT INTO genres (user_id, name, color) VALUES (?, ?, ?) RETURNING id",
        )
        .bind(user_id)
        .bind(name)
        .bind(color)
        .fetch_one(&self.pool)
        .await
        .unwrap();

        result.0
    }

    pub async fn create_test_book(&self, user_id: i64, title: &str, author: &str) -> i64 {
        let result = sqlx::query_as::<_, (i64,)>(
            "INSERT INTO books (user_id, title, author, cover_image, rating) VALUES (?, ?, ?, ?, ?) RETURNING id"
        )
        .bind(user_id)
        .bind(title)
        .bind(author)
        .bind(None::<String>)
        .bind(None::<f64>)
        .fetch_one(&self.pool)
        .await
        .unwrap();

        result.0
    }

    pub async fn add_tag_to_book(&self, book_id: i64, tag_id: i64) {
        sqlx::query("INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)")
            .bind(book_id)
            .bind(tag_id)
            .execute(&self.pool)
            .await
            .unwrap();
    }

    pub async fn add_genre_to_book(&self, book_id: i64, genre_id: i64) {
        sqlx::query("INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)")
            .bind(book_id)
            .bind(genre_id)
            .execute(&self.pool)
            .await
            .unwrap();
    }
}
