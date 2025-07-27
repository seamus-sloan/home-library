-- Rename users.avatar_color to users.color
ALTER TABLE users RENAME COLUMN avatar_color TO color;

-- Change user colors
UPDATE users SET color = '#7F1D1F' WHERE id = 1; -- Dark Red for Seamus
UPDATE users SET color = '#FF75FF' WHERE id = 2; -- Pink for Kelsey