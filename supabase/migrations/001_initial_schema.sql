-- Dream Weaver Database Schema
-- This migration creates the initial database structure for the Dream Weaver application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    privy_user_id TEXT UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Dream entries table
CREATE TABLE dream_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dream_date DATE NOT NULL,
    dream_text TEXT NOT NULL, -- This will be encrypted on the client side
    interpretation TEXT, -- This will be encrypted on the client side
    tags TEXT[], -- This will be encrypted on the client side
    emotions TEXT[], -- This will be encrypted on the client side
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- Indexes for better performance
CREATE INDEX idx_users_privy_user_id ON users(privy_user_id);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_dream_entries_user_id ON dream_entries(user_id);
CREATE INDEX idx_dream_entries_dream_date ON dream_entries(dream_date);
CREATE INDEX idx_dream_entries_created_at ON dream_entries(created_at);
CREATE INDEX idx_dream_entries_is_deleted ON dream_entries(is_deleted);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = privy_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = privy_user_id);

-- Dream entries policies
CREATE POLICY "Users can view own dreams" ON dream_entries
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE privy_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own dreams" ON dream_entries
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE privy_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own dreams" ON dream_entries
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE privy_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own dreams" ON dream_entries
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM users WHERE privy_user_id = auth.uid()::text
        )
    );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dream_entries_updated_at BEFORE UPDATE ON dream_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_dreams', COUNT(*),
        'dreams_with_interpretation', COUNT(*) FILTER (WHERE interpretation IS NOT NULL AND interpretation != ''),
        'dreams_this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)),
        'dreams_this_week', COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)),
        'oldest_dream', MIN(dream_date),
        'newest_dream', MAX(dream_date)
    ) INTO stats
    FROM dream_entries
    WHERE user_id = user_uuid AND is_deleted = false;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete dreams (for data recovery)
CREATE OR REPLACE FUNCTION soft_delete_dream(dream_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE dream_entries 
    SET is_deleted = true, updated_at = NOW()
    WHERE id = dream_uuid 
    AND user_id = user_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete old soft-deleted dreams (for GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_deleted_dreams()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM dream_entries 
    WHERE is_deleted = true 
    AND updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
