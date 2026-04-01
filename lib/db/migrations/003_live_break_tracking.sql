-- Live Break Tracking tables
-- Run this in Supabase SQL Editor to create the tables

-- Enum for session status
DO $$ BEGIN
  CREATE TYPE live_session_status AS ENUM ('live', 'ended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Live Sessions: one per stream
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES portal_users(id),
  platform VARCHAR(50) DEFAULT 'Whatnot',
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status live_session_status NOT NULL DEFAULT 'live',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live Breaks: individual breaks within a session
CREATE TABLE IF NOT EXISTS live_breaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES live_sessions(id),
  break_number INTEGER NOT NULL,
  total_cogs DECIMAL(10,2) NOT NULL,
  spots_sold INTEGER NOT NULL,
  sales_total DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  cost_per_spot DECIMAL(10,2),
  revenue_per_spot DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live Break Products: products used in each break
CREATE TABLE IF NOT EXISTS live_break_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  break_id UUID NOT NULL REFERENCES live_breaks(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_live_sessions_user_id ON live_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_sessions_user_status ON live_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_live_breaks_session_id ON live_breaks(session_id);
CREATE INDEX IF NOT EXISTS idx_live_break_products_break_id ON live_break_products(break_id);

-- RLS policies (enable if using Supabase auth directly)
-- ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE live_breaks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE live_break_products ENABLE ROW LEVEL SECURITY;
