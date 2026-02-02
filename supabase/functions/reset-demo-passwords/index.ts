import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const demoEmails = [
      'demo@yopmail.com',
      'demo2@yopmail.com',
      'demo3@yomail.com',
      'demo5@yopmail.com'
    ];

    const results = [];

    for (const email of demoEmails) {
      // Get user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        results.push({ email, error: listError.message });
        continue;
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        results.push({ email, error: 'User not found' });
        continue;
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: 'admin123' }
      );

      if (updateError) {
        results.push({ email, error: updateError.message });
      } else {
        results.push({ email, success: true });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
