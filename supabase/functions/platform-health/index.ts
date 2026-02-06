import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a platform health monitoring AI for a clinical cardiac monitoring system.

Analyze platform metrics and provide actionable insights for site administrators.

Focus on:
1. Study workload and bottlenecks
2. Device inventory status and predictions
3. Report turnaround times
4. Staff workload distribution
5. Urgent items requiring attention

Respond in JSON format:
{
  "healthScore": 85,
  "status": "healthy" | "warning" | "critical",
  "insights": [
    {
      "type": "urgent" | "warning" | "info" | "success",
      "title": "Brief title",
      "description": "Detailed description",
      "metric": "Optional metric value",
      "recommendation": "Actionable recommendation"
    }
  ],
  "predictions": [
    {
      "metric": "Device demand",
      "forecast": "12 devices needed by Feb 15",
      "confidence": 80
    }
  ],
  "workloadSummary": {
    "pendingStudies": 10,
    "pendingReports": 5,
    "avgTurnaroundHours": 2.5,
    "bottleneck": "Optional - where the workflow is slow"
  }
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metrics } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const userPrompt = `Analyze these platform health metrics and provide insights:

${JSON.stringify(metrics, null, 2)}

Provide a comprehensive health assessment with actionable recommendations.`;

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
    } catch (parseError) {
      console.error('Initial parse failed, attempting cleanup:', parseError);
      // Try to extract and clean JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean common JSON issues: trailing commas, unescaped quotes
          let cleaned = jsonMatch[0]
            .replace(/,\s*}/g, '}')  // Remove trailing commas before }
            .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
            .replace(/[\x00-\x1F\x7F]/g, ' '); // Remove control characters
          analysis = JSON.parse(cleaned);
        } catch (cleanupError) {
          console.error('Cleanup parse also failed:', cleanupError);
          // Return a fallback response instead of failing
          analysis = {
            healthScore: 75,
            status: 'healthy',
            insights: [
              {
                type: 'info',
                title: 'Analysis Temporarily Unavailable',
                description: 'AI analysis encountered an issue. Showing default metrics.',
                recommendation: 'Try refreshing in a moment.'
              }
            ],
            predictions: [],
            workloadSummary: {
              pendingStudies: 0,
              pendingReports: 0,
              avgTurnaroundHours: 0,
              bottleneck: null
            }
          };
        }
      } else {
        // Return fallback if no JSON found
        analysis = {
          healthScore: 75,
          status: 'healthy',
          insights: [],
          predictions: [],
          workloadSummary: { pendingStudies: 0, pendingReports: 0, avgTurnaroundHours: 0, bottleneck: null }
        };
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Platform health error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze platform health' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
