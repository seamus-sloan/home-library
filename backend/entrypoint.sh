#!/bin/bash

# Entrypoint script that starts both the application and cron

# Start cron daemon in background
service cron start

# Add cron job for to take a backup at 12PM every day
echo "* 12 * * * /app/backup.sh >> /var/log/backup.log 2>&1" | crontab -

# Create log file
touch /var/log/backup.log

echo "Cron job scheduled: Backup at 12PM every day"
echo "Starting application..."

# Start the main application
exec "$@"
