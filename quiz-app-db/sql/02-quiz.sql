-- Drop the table if it already exists
DROP TABLE IF EXISTS quiz CASCADE;

-- Create the quiz table
CREATE TABLE quiz (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL,
    access_code VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_till TIMESTAMP NULL,
    is_active VARCHAR(10) NOT NULL,
    session_id UUID UNIQUE NULL, -- Make session_id unique
    max_time INTEGER NOT NULL, -- New column for maximum time in seconds
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add an index to the access_code column
CREATE INDEX idx_quiz_access_code ON quiz(access_code);