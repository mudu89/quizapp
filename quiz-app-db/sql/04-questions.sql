DROP TABLE IF EXISTS questions CASCADE;

CREATE TABLE questions (
    id UUID PRIMARY KEY,
    access_code VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    question JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_code) REFERENCES quiz(access_code),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add an index to the access_code column
CREATE INDEX idx_questions_access_code ON questions(access_code);