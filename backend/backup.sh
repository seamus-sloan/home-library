#!/bin/bash

# Database backup script
# This script creates timestamped backups of the SQLite database

DB_FILE="${DATABASE_FILE:-/app/data/library.db}"
BACKUP_DIR="${BACKUP_DIR:-/app/data/backups}"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TEMP_BACKUP="/app/data/backup-$TIMESTAMP.db"
FINAL_BACKUP="$BACKUP_DIR/backup-$TIMESTAMP.db"

# Create backup next to database (always local filesystem for SQLite reliability)
if [ -f "$DB_FILE" ]; then
    echo "$(date): Creating backup of $DB_FILE"
    sqlite3 "$DB_FILE" ".backup $TEMP_BACKUP"

    if [ $? -eq 0 ] && [ -f "$TEMP_BACKUP" ] && [ -s "$TEMP_BACKUP" ]; then
        echo "$(date): Backup created: $TEMP_BACKUP ($(du -h "$TEMP_BACKUP" | cut -f1))"

        # Move backup to destination directory
        mkdir -p "$BACKUP_DIR"
        if mv "$TEMP_BACKUP" "$FINAL_BACKUP"; then
            echo "$(date): Backup moved to: $FINAL_BACKUP"
        else
            echo "$(date): Failed to move backup to $BACKUP_DIR" >&2
            exit 1
        fi

        # Count total backups after successful backup
        TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "backup-*.db" | wc -l)
        echo "$(date): Total backups: $TOTAL_BACKUPS"

        # If we have 8 backups, delete the oldest one
        if [ "$TOTAL_BACKUPS" -ge 8 ]; then
            OLDEST_BACKUP=$(find "$BACKUP_DIR" -name "backup-*.db" -type f -printf '%T+ %p\n' | sort | head -n1 | cut -d' ' -f2-)
            if [ -n "$OLDEST_BACKUP" ]; then
                echo "$(date): Removing oldest backup: $OLDEST_BACKUP"
                rm "$OLDEST_BACKUP"
                NEW_TOTAL=$(find "$BACKUP_DIR" -name "backup-*.db" | wc -l)
                echo "$(date): Cleanup complete. Total backups: $NEW_TOTAL"
            fi
        else
            echo "$(date): No cleanup needed (keeping all $TOTAL_BACKUPS backups)"
        fi
    else
        echo "$(date): Backup failed!" >&2
        rm -f "$TEMP_BACKUP"
        exit 1
    fi
else
    echo "$(date): Database file $DB_FILE not found!" >&2
    exit 1
fi
