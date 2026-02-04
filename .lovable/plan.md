

# Voice-Driven Form Input for Add Patient & Create Order Pages

## Overview

Add dedicated voice input buttons directly on the Add Patient and Create Order (service tag assignment) pages, allowing nurses to fill form fields by speaking without needing to open the chatbot.

## Current State

- **useVoiceCommand hook** already exists with Web Speech API integration
- **ClinicalCopilot** has voice-driven patient registration, but requires opening the chatbot first
- **AddPatient.tsx** has a multi-section form with 15+ fields
- **CreateOrder.tsx** has service tag, study type, diagnosis codes, and physician fields

## Implementation Approach

### 1. Create Reusable VoiceFormInput Component

A new component that can be embedded next to any form section header:

```text
┌─────────────────────────────────────────────────────────────┐
│  Patient Information  [🎤 Voice Input]                       │
│                                                              │
│  When clicked:                                               │
│  - Opens inline voice panel                                  │
│  - Shows "Listening..." with transcript preview              │
│  - AI parses speech → auto-fills form fields                 │
│  - Visual feedback for each field populated                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Toggle button next to section headers
- Real-time transcript display while speaking
- Uses AI edge function to parse natural speech into structured form data
- Auto-fills corresponding form fields
- Audio feedback ("Got first name: John")

### 2. Create Voice Form Parser Edge Function

New edge function `voice-form-parser` that:
- Accepts raw transcript + field schema
- Uses Gemini to extract structured data
- Returns JSON with field values

Example:
- **Input:** "John Smith, born January 15 1985, medical record number 12345, male, phone number 555-123-4567"
- **Output:** `{ firstName: "John", lastName: "Smith", dob: "1985-01-15", mrn: "12345", gender: "male", cellPhone: "5551234567" }`

### 3. Update AddPatient.tsx

Add voice input capability to the Patient Information section:

- Add "Voice Input" button next to "Patient Information" heading
- When active, show inline listening panel with transcript
- Parse transcript and auto-fill:
  - First Name, Middle Name, Last Name
  - Date of Birth
  - MRN
  - Race, Gender
  - Cell Phone, Email
  - Address fields
- Visual confirmation as each field populates

### 4. Update CreateOrder.tsx

Add voice input for service tag assignment section:

- Add "Voice Input" button next to study details
- Parse voice for:
  - Study Type ("14 day holter" → 14-day-xt)
  - Diagnosis descriptions → auto-suggest codes
  - Physician names
  - Pacemaker/ICD status ("patient has a pacemaker" → yes)

---

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `src/components/voice/VoiceFormInput.tsx` | **NEW** - Reusable voice input component |
| `src/hooks/useVoiceFormParser.ts` | **NEW** - Hook for voice-to-form parsing |
| `supabase/functions/voice-form-parser/index.ts` | **NEW** - AI edge function for parsing |
| `supabase/config.toml` | Add new function config |
| `src/pages/AddPatient.tsx` | Add VoiceFormInput component |
| `src/pages/CreateOrder.tsx` | Add VoiceFormInput component |

### VoiceFormInput Component API

```typescript
interface VoiceFormInputProps {
  sectionTitle: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'date' | 'select' | 'phone';
    options?: string[]; // For select fields
  }>;
  onFieldsParsed: (data: Record<string, string>) => void;
  className?: string;
}
```

### User Flow - Add Patient Page

```text
1. Nurse clicks [🎤 Voice Input] button
2. Button turns into expanded panel:
   ┌─────────────────────────────────────────────┐
   │ 🎤 Listening...                    [Stop]   │
   │                                             │
   │ "John Smith, born January 15 1985..."       │
   │                                             │
   │ ✓ First Name: John                          │
   │ ✓ Last Name: Smith                          │
   │ ✓ Date of Birth: 01/15/1985                 │
   │ ⏳ Waiting for more...                      │
   └─────────────────────────────────────────────┘
3. Form fields auto-populate below
4. Nurse clicks [Done] to close panel
5. Nurse can manually adjust any field
```

### User Flow - Create Order Page

```text
1. Nurse clicks [🎤 Voice Input] after selecting order type
2. Speaks: "14 day study, patient has palpitations and dizziness, 
   ordering physician Dr. Smith, patient has a pacemaker"
3. System parses:
   - Study Type → 14 Day XT
   - Diagnosis → Suggests palpitations/dizziness ICD codes
   - Ordering Physician → Dr. Smith
   - Pacemaker → Yes
4. Fields auto-fill with visual confirmation
```

### Edge Function: voice-form-parser

```typescript
// Request
{
  transcript: string,
  context: 'patient_registration' | 'order_creation',
  fieldSchema: Array<{ key: string, label: string, type: string, options?: string[] }>
}

// Response
{
  parsedFields: Record<string, string>,
  confidence: Record<string, number>,
  unparsedText: string
}
```

### Error Handling

- Microphone permission denied → Show toast with instructions
- No speech detected → Show "Try speaking again" prompt
- Low confidence parse → Highlight field for manual review
- Browser not supported → Hide voice button, show tooltip on hover

---

## Summary

This implementation adds inline voice input directly on the Add Patient and Create Order pages, eliminating the need to open the chatbot for voice-driven workflows. The reusable `VoiceFormInput` component can be placed next to any form section header, making it easy to extend to other pages in the future.

