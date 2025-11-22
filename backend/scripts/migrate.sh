#!/bin/bash

# Database Migration Runner Script
# This script applies all SQL migrations in order

set -e

echo "========================================"
echo "Database Migration Script"
echo "========================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-company_forum}
DB_USER=${DB_USER:-forum_user}
DB_PASSWORD=${DB_PASSWORD}

# Check if database exists
echo "Checking database connection..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    exit 1
fi

# Create database if not exists
echo "Creating database if not exists..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Apply main schema
echo "Applying main database schema..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ../database/complete_forum_database.sql

if [ $? -eq 0 ]; then
    echo "✓ Database schema applied successfully"
else
    echo "✗ Failed to apply database schema"
    exit 1
fi

# Create migration tracking table
echo "Creating migration tracking table..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
EOF

# Apply additional migrations if any
MIGRATIONS_DIR="./migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
    echo "Looking for additional migrations..."
    for migration in $(ls -1 $MIGRATIONS_DIR/*.sql 2>/dev/null | sort); do
        migration_name=$(basename "$migration")
        
        # Check if migration already applied
        is_applied=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -se "SELECT COUNT(*) FROM migrations WHERE name='$migration_name'")
        
        if [ "$is_applied" -eq 0 ]; then
            echo "Applying migration: $migration_name"
            mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration"
            
            if [ $? -eq 0 ]; then
                mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "INSERT INTO migrations (name) VALUES ('$migration_name')"
                echo "✓ Migration applied: $migration_name"
            else
                echo "✗ Failed to apply migration: $migration_name"
                exit 1
            fi
        else
            echo "⊗ Migration already applied: $migration_name"
        fi
    done
fi

echo "========================================"
echo "✓ All migrations completed successfully"
echo "========================================"
