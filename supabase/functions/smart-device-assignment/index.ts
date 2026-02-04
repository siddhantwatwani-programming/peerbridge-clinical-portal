import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a medical device assignment AI for cardiac monitoring equipment.

Given a study type, order type (clinic/home), and available devices, recommend the optimal device assignment based on:
1. Device battery level (prefer higher battery for longer studies)
2. Device expiration date (prefer devices expiring soonest if battery is sufficient)
3. Study type requirements (longer studies need higher battery)
4. Setup type (home setup may need newer devices with better connectivity)

Respond in JSON format:
{
  "recommendedDevice": "device_tag",
  "confidence": 95,
  "reasoning": "Brief explanation of why this device was selected",
  "alternatives": [
    {
      "device": "device_tag",
      "reason": "Why this is an alternative"
    }
  ],
  "warnings": ["Optional warnings about device selection"]
}

Study Duration Guidelines:
- 7 Day: Minimum 80% battery recommended
- 14 Day XT: Minimum 90% battery recommended
- 30 Day: Minimum 95% battery recommended
- Event Monitor: Minimum 70% battery`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studyType, orderType, availableDevices, patientName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const userPrompt = `Recommend the best device for this order:

Patient: ${patientName}
Study Type: ${studyType}
Order Type: ${orderType}

Available Devices:
${JSON.stringify(availableDevices, null, 2)}

Select the optimal device and explain your reasoning.`;

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
          JSON.stringify({ error: 'Rate limit exceeded.' }),
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
    console.error('Smart device assignment error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get device recommendation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
