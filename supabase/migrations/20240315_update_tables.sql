-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns to the existing user_connections table if they don't exist
DO $$
BEGIN
    -- Add connected_services column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_connections' 
        AND column_name = 'connected_services'
    ) THEN
        ALTER TABLE public.user_connections ADD COLUMN connected_services TEXT[] DEFAULT '{}'::text[];
    END IF;

    -- Add entity_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_connections' 
        AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE public.user_connections ADD COLUMN entity_id TEXT;
    END IF;
END
$$;

-- Create connection_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'connected', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on connection_requests table
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Connection requests access policy - users can only access their own requests
CREATE POLICY IF NOT EXISTS "Users can only access their own connection requests"
  ON public.connection_requests
  FOR SELECT
  USING (auth.uid() = user_id);
  
-- Allow users to insert their own connection requests
CREATE POLICY IF NOT EXISTS "Users can insert their own connection requests"
  ON public.connection_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
-- Allow users to update their own connection requests
CREATE POLICY IF NOT EXISTS "Users can update their own connection requests"
  ON public.connection_requests
  FOR UPDATE
  USING (auth.uid() = user_id);
  
-- Allow users to delete their own connection requests
CREATE POLICY IF NOT EXISTS "Users can delete their own connection requests"
  ON public.connection_requests
  FOR DELETE
  USING (auth.uid() = user_id); 