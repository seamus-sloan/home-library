#!/bin/bash

# Database backup script
# This script creates timestamped backups of the SQLite database

DB_FILE="${DATABASE_FILE:-/app/data/library.db}"
BACKUP_DIR="/app/data/backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup using sqlite3
if [ -f "$DB_FILE" ]; then
    echo "$(date): Creating backup of $DB_FILE to $BACKUP_FILE"
    sqlite3 "$DB_FILE" ".backup $BACKUP_FILE"
    
    if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        echo "$(date): Backup successful: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
        
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
        exit 1
    fi
else
    echo "$(date): Database file $DB_FILE not found!" >&2
    exit 1
fi
