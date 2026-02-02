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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId, email } = await req.json();
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'userId and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only seed for demo account
    if (email !== 'demo@peerbridge.health') {
      return new Response(
        JSON.stringify({ message: 'Not a demo account, skipping seed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Site and role mappings from the database
    const memberships = [
      {
        user_id: userId,
        site_id: '157e668d-f13d-48b0-a115-de0ef0756d17', // Dev Clinic
        role_id: '4487814e-dfaa-4b3d-b358-b2fd21d367f8', // Site Admin
        is_active: true,
        accepted_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        site_id: 'ee777b79-b801-48fc-95a0-770ab00cd54d', // Metro Heart Center
        role_id: '9a911c6b-9651-4f8f-b763-87fa1e49a8e2', // Interpreter
        is_active: true,
        accepted_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        site_id: '94350718-a57d-424f-9d7e-a5a2783d864d', // Coastal Health Partners
        role_id: 'fc5256ed-4196-45ee-ae80-beae26f68f29', // Viewer
        is_active: true,
        accepted_at: new Date().toISOString(),
      },
    ];

    // Insert memberships (upsert to avoid duplicates)
    const { error: insertError } = await supabase
      .from('site_memberships')
      .upsert(memberships, { 
        onConflict: 'user_id,site_id',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error('Error inserting memberships:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo user seeded with 3 site memberships',
        sites: ['Dev Clinic (Admin)', 'Metro Heart Center (Interpreter)', 'Coastal Health Partners (Viewer)']
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
