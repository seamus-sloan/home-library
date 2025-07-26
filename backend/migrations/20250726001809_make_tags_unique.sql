-- Changes tags "tag" to "name" and adds unique constraint
ALTER TABLE tags RENAME COLUMN tag TO name;

UPDATE tags
SET name = name || "_" || id
WHERE name IN (
    SELECT name
    FROM tags
    GROUP BY name
    HAVING COUNT(*) > 1
);

-- Now add the unique constraint
CREATE UNIQUE INDEX unique_tag_name ON tags (name);