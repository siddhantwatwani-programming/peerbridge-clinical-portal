import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an inventory prediction AI for a cardiac monitoring device company (Peerbridge).

Given the current device inventory data (statuses, use-by dates, product types), predict device demand for the next 30 days.

Analyze:
1. Current device availability vs assigned/retired counts
2. Devices nearing expiration (use-by date within 30 days)
3. Assignment patterns (ratio of assigned vs available)
4. Seasonal and scheduling trends based on current date

Respond in JSON format:
{
  "demandForecast": {
    "next30Days": <number of additional devices likely needed>,
    "targetDate": "<date string>",
    "confidence": <0-100>,
    "reasoning": "<brief explanation>"
  },
  "expiringDevices": [
    {
      "serviceTag": "<tag>",
      "useByDate": "<date>",
      "daysUntilExpiry": <number>,
      "recommendation": "<prioritize for assignment | retire soon | replace>"
    }
  ],
  "alerts": [
    {
      "severity": "critical" | "warning" | "info",
      "message": "<alert text>",
      "metric": "<relevant metric>"
    }
  ],
  "utilization": {
    "totalDevices": <number>,
    "assigned": <number>,
    "available": <number>,
    "retired": <number>,
    "unavailable": <number>,
    "utilizationRate": <percentage>
  },
  "recommendations": [
    "<actionable recommendation string>"
  ]
}

Be specific with numbers. Reference actual device service tags when recommending expiring devices for priority assignment.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { devices, currentDate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const userPrompt = `Analyze this device inventory and predict demand for the next 30 days.

Current Date: ${currentDate || new Date().toISOString().split('T')[0]}

Device Inventory:
${JSON.stringify(devices, null, 2)}

Provide demand forecast, identify expiring devices needing priority assignment, and generate actionable alerts.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Inventory prediction error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate inventory predictions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
