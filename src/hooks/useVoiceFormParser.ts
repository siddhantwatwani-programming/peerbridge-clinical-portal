import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceCommand } from './useVoiceCommand';
import { toast } from 'sonner';

export interface FieldSchema {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'phone' | 'email';
  options?: string[];
}

export interface ParsedResult {
  parsedFields: Record<string, string>;
  confidence: Record<string, number>;
  unparsedText: string;
}

interface UseVoiceFormParserOptions {
  context: 'patient_registration' | 'order_creation';
  fieldSchema: FieldSchema[];
  onFieldsParsed: (fields: Record<string, string>, confidence: Record<string, number>) => void;
}

export function useVoiceFormParser(options: UseVoiceFormParserOptions) {
  const { context, fieldSchema, onFieldsParsed } = options;
  
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFields, setParsedFields] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const parseTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setIsParsing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voice-form-parser', {
        body: { transcript, context, fieldSchema }
      });

      if (fnError) throw fnError;

      if (data?.parsedFields) {
        setParsedFields(data.parsedFields);
        setConfidence(data.confidence || {});
        onFieldsParsed(data.parsedFields, data.confidence || {});
        
        // Count successfully parsed fields
        const fieldCount = Object.values(data.parsedFields).filter(v => v && v !== '').length;
        if (fieldCount > 0) {
          toast.success(`Parsed ${fieldCount} field${fieldCount > 1 ? 's' : ''} from voice input`);
        }
      }
    } catch (err) {
      console.error('Voice parsing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse voice input');
      toast.error('Failed to parse voice input. Please try again.');
    } finally {
      setIsParsing(false);
    }
  }, [context, fieldSchema, onFieldsParsed]);

  const voiceCommand = useVoiceCommand({
    onTranscript: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        parseTranscript(transcript);
      }
    },
    onError: (err) => {
      if (err === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err !== 'aborted' && err !== 'no-speech') {
        toast.error(`Voice recognition error: ${err}`);
      }
    },
    continuous: true
  });

  const reset = useCallback(() => {
    setParsedFields({});
    setConfidence({});
    setError(null);
  }, []);

  return {
    // Voice state
    isListening: voiceCommand.isListening,
    isSupported: voiceCommand.isSupported,
    transcript: voiceCommand.transcript,
    
    // Parsing state
    isParsing,
    parsedFields,
    confidence,
    error,
    
    // Actions
    startListening: voiceCommand.startListening,
    stopListening: voiceCommand.stopListening,
    toggleListening: voiceCommand.toggleListening,
    reset
  };
}
