#!/bin/bash

# Database credentials from environment variables
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5434}
DB_NAME=${POSTGRES_DB:-sky-quiz-db}
DB_USER=${POSTGRES_USER:-developer}
DB_PASSWORD=${POSTGRES_PASSWORD:-developer}

# Export password to avoid password prompt


# Path to the SQL folder
SQL_FOLDER="./sql"

echo "SQL_FOLDER: $SQL_FOLDER"
# Ensure the SQL folder exists
if [ ! -d "$SQL_FOLDER" ]; then
  echo "Error: SQL folder '$SQL_FOLDER' not found."
  exit 1
fi
export PGPASSWORD=postgres
echo "DB_PASSWORD: $PGPASSWORD"

psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c '\q'

if [ $? -ne 0 ]; then
  echo "Error: Unable to connect to the database. Please check your credentials."
  exit 1
fi
export PGPASSWORD=$DB_PASSWORD
# Execute create_database.sql first
CREATE_DB_FILE="$SQL_FOLDER/create_database.sql"
if [ -f "$CREATE_DB_FILE" ]; then
  echo "Executing $CREATE_DB_FILE..."
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -f "$CREATE_DB_FILE"
else
  echo "Error: $CREATE_DB_FILE not found."
  exit 1
fi

# Loop through all other SQL files in the folder and execute them
for SQL_FILE in "$SQL_FOLDER"/*.sql; do
  # Skip create_database.sql as it has already been executed
  if [ "$SQL_FILE" == "$CREATE_DB_FILE" ]; then
    continue
  fi

  echo "Executing $SQL_FILE..."
  psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "$SQL_FILE"
done

# Unset the password variable
unset PGPASSWORD

echo "All SQL scripts executed successfully."