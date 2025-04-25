DROP TABLE IF EXISTS quiz_executions CASCADE;

CREATE TABLE quiz_executions (
    id UUID PRIMARY KEY,
    access_code VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    session_id UUID NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    score INTEGER DEFAULT 0,
    FOREIGN KEY (access_code) REFERENCES quiz(access_code),
);

-- Add an index to the access_code column
CREATE INDEX idx_quiz_executions_access_code ON quiz_executions(access_code);

-- Add an index to the session_id column
CREATE INDEX idx_quiz_executions_session_id ON quiz_executions(session_id);