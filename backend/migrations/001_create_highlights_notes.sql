-- Create highlights table
CREATE TABLE IF NOT EXISTS highlights (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_id VARCHAR(36) REFERENCES sources(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    source_url TEXT,
    source_title VARCHAR(500),
    note TEXT,
    color VARCHAR(20) DEFAULT '#fef3c7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_id VARCHAR(36) REFERENCES sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source_url TEXT,
    source_title VARCHAR(500),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_source_id ON highlights(source_id);
CREATE INDEX idx_highlights_created_at ON highlights(created_at DESC);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_source_id ON notes(source_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Create temporary user for testing
INSERT INTO users (id, email, hashed_password, is_active)
VALUES ('temp-user-123', 'temp@synapse.local', 'temp', true)
ON CONFLICT (id) DO NOTHING;
