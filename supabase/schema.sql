-- Supabase SQL DDL Schema for Phase 2: Second Brain

-- Enable uuid-ossp extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index on email for fast user lookup during auth
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Create topics table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_topic UNIQUE(user_id, title)
);

-- Index for querying a user's topics
CREATE INDEX IF NOT EXISTS idx_topics_user ON topics(user_id);

-- 3. Create connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    field VARCHAR(255) NOT NULL,
    analogy TEXT NOT NULL,
    explanation TEXT NOT NULL,
    fun_fact TEXT NOT NULL,
    emoji VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for nested retrieval of connections per topic
CREATE INDEX IF NOT EXISTS idx_connections_topic ON connections(topic_id);
