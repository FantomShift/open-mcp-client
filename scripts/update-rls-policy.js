// Update RLS policy for connection_requests table
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function updateRLSPolicies() {
  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Drop the ALL policy if it exists
    await supabase.rpc('execute_sql', {
      query: `
        DROP POLICY IF EXISTS "Users can only access their own connection requests" ON public.connection_requests;
      `
    });
    
    console.log('Dropped existing ALL policy');
    
    // Create separate policies for each operation
    const policies = [
      {
        name: "Users can only access their own connection requests",
        operation: "SELECT",
        using: "auth.uid() = user_id"
      },
      {
        name: "Users can insert their own connection requests",
        operation: "INSERT",
        check: "auth.uid() = user_id"
      },
      {
        name: "Users can update their own connection requests",
        operation: "UPDATE",
        using: "auth.uid() = user_id"
      },
      {
        name: "Users can delete their own connection requests",
        operation: "DELETE",
        using: "auth.uid() = user_id"
      }
    ];
    
    for (const policy of policies) {
      if (policy.operation === 'INSERT') {
        await supabase.rpc('execute_sql', {
          query: `
            CREATE POLICY "${policy.name}"
              ON public.connection_requests
              FOR ${policy.operation}
              WITH CHECK (${policy.check});
          `
        });
      } else {
        await supabase.rpc('execute_sql', {
          query: `
            CREATE POLICY "${policy.name}"
              ON public.connection_requests
              FOR ${policy.operation}
              USING (${policy.using});
          `
        });
      }
      
      console.log(`Created ${policy.operation} policy: ${policy.name}`);
    }
    
    console.log('All RLS policies updated successfully!');
  } catch (error) {
    console.error('Error updating RLS policies:', error);
    process.exit(1);
  }
}

updateRLSPolicies(); 