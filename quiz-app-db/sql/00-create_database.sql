-- Create the database if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_database WHERE datname = 'sky-quiz-db'
    ) THEN
        CREATE DATABASE "sky-quiz-db";
    END IF;
END
$$;

-- Create the database user if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = 'developer'
    ) THEN
        CREATE USER developer WITH PASSWORD 'developer';
    END IF;
END
$$;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE "sky-quiz-db" TO developer;