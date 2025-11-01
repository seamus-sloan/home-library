-- Add avatar_image column to users table
-- This will store base64-encoded image data or image URLs
ALTER TABLE users ADD COLUMN avatar_image TEXT;
