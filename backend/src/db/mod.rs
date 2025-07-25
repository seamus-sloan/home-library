pub mod book_queries;
pub mod journal_queries;
pub mod pool;
pub mod user_queries;

// Re-export commonly used functions
pub use book_queries::*;
pub use journal_queries::*;
pub use pool::init_db;
pub use user_queries::*;
