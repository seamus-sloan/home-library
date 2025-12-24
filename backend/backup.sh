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

        # Copy to NAS if NAS_BACKUP_DIR is set
        if [ -n "$NAS_BACKUP_DIR" ]; then
            NAS_BACKUP_FILE="$NAS_BACKUP_DIR/backup-$TIMESTAMP.db"
            echo "$(date): Copying backup to NAS: $NAS_BACKUP_FILE"

            # Ensure NAS backup directory exists
            mkdir -p "$NAS_BACKUP_DIR" 2>/dev/null || true

            # Copy to NAS
            cp "$BACKUP_FILE" "$NAS_BACKUP_FILE"

            if [ $? -eq 0 ] && [ -f "$NAS_BACKUP_FILE" ]; then
                echo "$(date): NAS backup successful: $NAS_BACKUP_FILE ($(du -h "$NAS_BACKUP_FILE" | cut -f1))"
            else
                echo "$(date): NAS backup failed (non-critical - local backup exists)" >&2
            fi
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
        exit 1
    fi
else
    echo "$(date): Database file $DB_FILE not found!" >&2
    exit 1
fi
