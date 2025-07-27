pub mod book_queries;
pub mod genre_queries;
pub mod journal_queries;
pub mod pool;
pub mod tag_queries;
pub mod user_queries;

// Re-export commonly used functions
pub use genre_queries::*;
pub use journal_queries::*;
pub use pool::init_db;
pub use tag_queries::*;
pub use user_queries::*;
