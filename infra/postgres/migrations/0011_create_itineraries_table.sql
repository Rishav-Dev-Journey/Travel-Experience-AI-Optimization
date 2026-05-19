-- Create itineraries table to store AI-generated travel itineraries
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  overview TEXT NOT NULL,
  day_plans JSONB NOT NULL,
  packing_list TEXT[] NOT NULL DEFAULT '{}',
  budget_breakdown TEXT[] NOT NULL DEFAULT '{}',
  travel_tips TEXT[] NOT NULL DEFAULT '{}',
  sources TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS ix_itineraries_created_at ON itineraries(created_at DESC);
