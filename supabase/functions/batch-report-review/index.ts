import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a clinical AI assistant helping physicians efficiently review multiple ECG reports.

Your task is to:
1. Analyze each report and provide a 2-line clinical summary
2. Categorize reports for batch processing (group similar findings)
3. Flag reports that need detailed attention vs routine sign-off

Respond in JSON format:
{
  "reports": [
    {
      "id": "report_id",
      "quickSummary": "2-line clinical summary",
      "category": "normal" | "abnormal-minor" | "abnormal-major" | "requires-attention",
      "batchEligible": true | false,
      "flagReason": "Optional - why this needs detailed review"
    }
  ],
  "batchGroups": [
    {
      "category": "normal",
      "count": 5,
      "description": "Normal NSR reports ready for batch sign-off"
    }
  ]
}

Categories:
- normal: Normal sinus rhythm, no significant findings
- abnormal-minor: Minor abnormalities (rare PVCs, mild bradycardia)
- abnormal-major: Major findings (AFib, VT, significant pauses)
- requires-attention: Complex cases needing detailed physician review`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reports } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const reportData = reports.map((r: any) => ({
      id: r.id,
      patient: r.patientName,
      studyType: r.studyType,
      status: r.reportStatus,
      dates: `${r.startDate} - ${r.endDate}`
    }));

    const userPrompt = `Analyze these reports for batch review processing:

${JSON.stringify(reportData, null, 2)}

Provide summary and categorization for each report.`;

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
    console.error('Batch report review error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze reports' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
