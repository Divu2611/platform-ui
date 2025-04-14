--------------- THREADS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS threads (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- RELATIONSHIP
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX idx_threads_chat_id ON threads (chat_id);

-- RLS --

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow access to threads via chat ownership"
    ON threads
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = threads.chat_id AND chats.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = threads.chat_id AND chats.user_id = auth.uid()
        )
    );

-- TRIGGERS --

CREATE TRIGGER update_threads_updated_at
BEFORE UPDATE ON threads 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();
