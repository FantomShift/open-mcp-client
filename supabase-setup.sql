-- Create the user_connections table to store service configurations for each user
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create policy to ensure users can only access their own connections
CREATE POLICY "Users can only access their own connections"
  ON user_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Enable RLS on the table
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY; 