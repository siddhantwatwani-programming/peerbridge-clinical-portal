import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FieldSchema {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'phone' | 'email';
  options?: string[];
}

interface ParseRequest {
  transcript: string;
  context: 'patient_registration' | 'order_creation';
  fieldSchema: FieldSchema[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, context, fieldSchema } = await req.json() as ParseRequest;

    if (!transcript || !fieldSchema) {
      return new Response(
        JSON.stringify({ error: 'Missing transcript or fieldSchema' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build field descriptions for the prompt
    const fieldDescriptions = fieldSchema.map(f => {
      let desc = `- ${f.key} (${f.label}): ${f.type}`;
      if (f.options && f.options.length > 0) {
        desc += ` - valid options: ${f.options.join(', ')}`;
      }
      return desc;
    }).join('\n');

    const contextPrompts: Record<string, string> = {
      patient_registration: `You are parsing voice input for patient registration in a healthcare system.
Extract patient information from the spoken text. Be flexible with how people naturally speak dates, names, and numbers.

Common patterns:
- "John Smith" or "first name John, last name Smith"
- "born January 15 1985" or "date of birth 01/15/1985" or "DOB January fifteenth nineteen eighty five"
- "MRN 12345" or "medical record number 12345"
- "male" or "gender male" or "he is male"
- "phone 555-123-4567" or "cell phone number 5551234567"
- "email john@example.com" or "email address john at example dot com"
- Race: white, black/african american, asian, hispanic/latino, native american, pacific islander, other
- Gender: male, female, other`,

      order_creation: `You are parsing voice input for creating a medical study order.
Extract order details from the spoken text. Be flexible with medical terminology.

Common patterns:
- Study types: "14 day study", "30 day holter", "7 day XT", "event monitor"
- "patient has a pacemaker" → hasPacemaker: "yes"
- "no ICD" or "patient does not have an ICD" → hasICD: "no"
- "ordering physician Dr. Smith" or "Dr. Smith is the ordering physician"
- Diagnosis hints: "palpitations", "dizziness", "syncope", "chest pain", "shortness of breath"

Map study type mentions:
- "14 day" → "14-day-xt"
- "30 day" → "30-day"
- "7 day" → "7-day"
- "event" → "event-monitor"`
    };

    const systemPrompt = contextPrompts[context] || contextPrompts.patient_registration;

    const prompt = `${systemPrompt}

Fields to extract:
${fieldDescriptions}

User said: "${transcript}"

Extract the values for each field. Return a JSON object with:
1. "parsedFields": object with field keys and extracted values (use empty string if not mentioned)
2. "confidence": object with field keys and confidence scores (0.0 to 1.0)
3. "unparsedText": any part of the transcript that couldn't be mapped to a field

For dates, format as YYYY-MM-DD.
For phone numbers, keep only digits.
For select fields, match to the closest valid option.

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable Voice Form Parser',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the JSON response
    let parsedResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return empty result on parse failure
      parsedResult = {
        parsedFields: {},
        confidence: {},
        unparsedText: transcript
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice form parser error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
