import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a clinical decision support AI for cardiac monitoring. Analyze patient transmissions and provide triage information.

For each transmission, evaluate the clinical urgency based on:
- Reported symptoms (syncope, chest pain, palpitations, SOB are concerning)
- Correlation between symptoms and potential cardiac findings
- Time since last review

Provide a response in JSON format:
{
  "transmissions": [
    {
      "id": "transmission_id",
      "alertLevel": "critical" | "high" | "moderate" | "low",
      "summary": "Brief 1-2 sentence clinical summary",
      "symptomCorrelation": "Optional - if symptoms suggest specific cardiac findings"
    }
  ]
}

Alert Levels:
- critical: Syncope, severe chest pain, signs of arrhythmia requiring immediate attention
- high: Significant symptoms like palpitations with presyncope, new AFib
- moderate: Mild symptoms, routine follow-up needed
- low: No symptoms or asymptomatic, stable study`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transmissions } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const transmissionData = transmissions.map((t: any) => ({
      id: t.id,
      patient: t.patient,
      symptom: t.symptomDescription,
      status: t.status,
      date: t.createdDate
    }));

    const userPrompt = `Analyze these patient transmissions for clinical urgency:

${JSON.stringify(transmissionData, null, 2)}

Provide triage assessment for each transmission.`;

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
    console.error('Transmission triage error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze transmissions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
