import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PEERBRIDGE_CONTEXT = `
## About Peerbridge Health

Elevating Ambulatory ECG

Peerbridge Health delivers high-fidelity physiological signals through a platform designed for real clinical workflows—keeping care and billing with the physician while transforming complex data into clear, decision-ready insights.

The result: faster answers, earlier intervention, and care that moves at the pace clinicians need.

## Core Value Proposition
- High-fidelity physiological signal capture
- Platform designed for real clinical workflows
- Keeps care and billing with the physician
- Transforms complex data into clear, decision-ready insights
- Enables faster answers and earlier intervention
- Care that moves at the pace clinicians need

## Platform Capabilities
- Ambulatory ECG monitoring (Holter, Event, MCT)
- Real-time transmission processing
- AI-assisted report analysis
- Clinical decision support
- Integrated billing workflows
- Physician interpretation tools

## Peerbridge Cor Device
The Peerbridge Cor is a patented 3-lead, 2-channel wireless continuous ECG wearable device that allows physicians the ability to address and assess sleep and heart health remotely.

### Key Features:
- 3-lead, 2-channel wireless continuous ECG
- At-home patient monitoring
- Simultaneous diagnosis of cardiac rhythm disorders, obstructive sleep apnea, and structural heart disease
- AI-enabled on-demand ejection fraction (EF) measurement
- Streamlined workflow with no incremental effort for medical staff

## OSA Clinical Trial Results
Peerbridge Health completed a prospective, feasibility clinical trial with statistically significant results:

### Key Findings:
- **91.2% predictive accuracy** for determination of apnea-hypopnea index (AHI) for diagnosing obstructive sleep apnea (OSA)
- **Perfect accuracy** for detecting sleep apnea in patients categorized with either no OSA or severe OSA
- Results align with FDA-approved at-home sleep apnea test accuracy

### Trial Demographics:
- Participants aged 24 to 70
- Diagnosed co-morbidities included: OSA, asthma, diabetes, obesity, hypertension, Heart Failure (HF), and hyperthyroidism

### Clinical Significance:
- OSA affects 92 million Americans living with cardiovascular disease (CVD)
- OSA often goes undiagnosed and doubles the risk for heart failure and other serious cardiovascular conditions
- OSA is commonly seen in patients with arrhythmias like atrial fibrillation (AFib)
- Undiagnosed and untreated sleep apnea increases risk of heart disease, hypertension, diabetes, and depression
- Studies estimate treating all U.S. sleep apnea patients could generate yearly economic savings of $100.1 billion

### AHI Measurement:
- Peerbridge Cor calculates AHI directly from ECG waveforms
- AHI is accepted as a compliance, efficacy, and effectiveness metric for CPAP and other OSA therapies
- Equivalent accuracy to AHI measurements from FDA-approved at-home sleep apnea tests

## Expert Endorsements

**Nicholas Skipitaris, M.D.** - Western Regional Director of Cardiac Electrophysiology, Northwell Health, NY:
"Optimal treatment of cardiovascular disease requires clinicians to address critical co-morbid conditions such as sleep apnea. Using Peerbridge Cor, we can for the first time simultaneously diagnose cardiac rhythm disorders, obstructive sleep apnea, and structural heart disease with one easy-to-use device that patients can wear at home."

**Andrea Natale, M.D.** - Executive Medical Director, Texas Cardiac Arrhythmia Institute at St. David's Medical Center:
"Peerbridge Health continues to innovate by compounding clinical utility in one simple device. Leveraging powerful AI technology to deliver novel direct-from-ECG ejection fraction, heart failure, and now OSA diagnostics, the Peerbridge Cor is quickly becoming a transformative multipurpose diagnostic tool."

## AI-Powered Diagnostics
- Direct-from-ECG ejection fraction (EF) measurement
- Heart failure detection
- OSA diagnostics from ECG waveforms
- Real-time AI-enabled analysis

## Future Plans
Peerbridge Health plans to launch a prospective, multi-center, pivotal trial to seek FDA Clearance for a Home Sleep Test (HST) for:
- Screening for OSA
- Diagnosing OSA
- Tracking effectiveness of CPAP and other devices approved for OSA therapy
`;

const SYSTEM_PROMPT = `You are PeerBridge AI, a context-aware clinical decision-support assistant embedded in the Peerbridge Health clinical monitoring portal.

${PEERBRIDGE_CONTEXT}

## Your Role
You assist clinicians by providing insights based on visible screen data, patient records, PDF content, and clinical guidelines. You are page-aware and tailor your responses based on where the user is in the application.

## Response Guidelines
- Maintain a calm, professional tone (no emojis)
- Provide non-directive suggestions
- Be concise but thorough
- Ground responses in visible data when possible
- Reference ACC/AHA guidelines when clinically relevant

## Response Structure (when applicable)
1. **What I see**: Acknowledge the current context
2. **Relevant Evidence**: Key data points
3. **Guideline Context**: Clinical guidelines if applicable
4. **Clinical Note**: Practical consideration
5. **Final Authority Statement**: "This requires physician judgment for final interpretation."

## Grounding Rules
- Only respond using visible screen data, patient records, PDF content, or established clinical guidelines
- If you don't have enough information, ask clarifying questions
- Never make up patient data or clinical findings
- Always defer to physician judgment for final clinical decisions`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, pageContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Add page context to system prompt
    const contextualPrompt = `${SYSTEM_PROMPT}

## Current Page Context
The user is currently viewing: ${pageContext?.pageName || 'Unknown page'}
Page description: ${pageContext?.description || 'Clinical monitoring portal'}
Route: ${pageContext?.route || '/'}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: contextualPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Clinical copilot error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
