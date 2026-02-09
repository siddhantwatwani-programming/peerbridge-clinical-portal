import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();

    if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please provide a symptom description.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a medical coding assistant specializing in ICD-10-CM codes for cardiac monitoring and electrophysiology.

Given a natural-language description of patient symptoms, return the top 3 most relevant ICD-10-CM codes.

IMPORTANT RULES:
- Only suggest real, valid ICD-10-CM codes
- Focus on cardiac, arrhythmia, and electrophysiology-related codes
- Rank by clinical relevance to the described symptoms
- Include the full official description for each code

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    { "code": "I49.9", "description": "Cardiac arrhythmia, unspecified", "confidence": 92, "rationale": "Brief clinical reasoning" },
    { "code": "R00.2", "description": "Palpitations", "confidence": 88, "rationale": "Brief clinical reasoning" },
    { "code": "R42", "description": "Dizziness and giddiness", "confidence": 75, "rationale": "Brief clinical reasoning" }
  ]
}`
          },
          {
            role: 'user',
            content: `Patient symptoms: ${symptoms}`
          }
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
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ICD-10 suggest error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get ICD-10 suggestions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
