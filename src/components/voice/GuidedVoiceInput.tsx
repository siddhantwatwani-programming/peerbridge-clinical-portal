import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, X, Check, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { toast } from 'sonner';

export interface MandatoryField {
  key: string;
  label: string;
  question: string;
  type: 'text' | 'date' | 'select' | 'phone' | 'email';
  options?: { value: string; label: string }[];
}

interface GuidedVoiceInputProps {
  fields: MandatoryField[];
  onFieldCaptured: (key: string, value: string) => void;
  onComplete: () => void;
  className?: string;
}

export function GuidedVoiceInput({ 
  fields, 
  onFieldCaptured, 
  onComplete,
  className 
}: GuidedVoiceInputProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [capturedValues, setCapturedValues] = useState<Record<string, string>>({});
  // Used for both TTS speaking and short UI transitions
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState('');
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);
  const lastHandledFinalRef = useRef<string>('');
  const isActiveRef = useRef(false);
  const currentFieldIndexRef = useRef(0);
  const awaitingConfirmationRef = useRef(false);
  const isProcessingRef = useRef(false);

  const currentField = fields[currentFieldIndex];
  const isComplete = currentFieldIndex >= fields.length;

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  useEffect(() => {
    currentFieldIndexRef.current = currentFieldIndex;
  }, [currentFieldIndex]);
  useEffect(() => {
    awaitingConfirmationRef.current = awaitingConfirmation;
  }, [awaitingConfirmation]);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Text-to-speech function
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Some browsers occasionally fail to fire onend/onerror; add a timeout fallback.
        // Keep this conservative to avoid hanging the flow on "Processing...".
        const fallbackMs = Math.min(12000, Math.max(3500, Math.round(text.length * 55)));
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          isSpeakingRef.current = false;
          resolve();
        };

        isSpeakingRef.current = true;
        utterance.onend = settle;
        utterance.onerror = settle;
        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        window.setTimeout(settle, fallbackMs);
      } else {
        resolve();
      }
    });
  }, []);

  // Stop speech
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Process the captured transcript for the current field
  const processTranscript = useCallback((transcript: string) => {
    // Ignore anything while we're speaking, processing, or waiting for user confirmation.
    if (
      !currentField ||
      isSpeakingRef.current ||
      isProcessingRef.current ||
      awaitingConfirmationRef.current ||
      !isActiveRef.current
    ) {
      return;
    }
    
    let processedValue = transcript.trim();
    
    // Handle date fields
    if (currentField.type === 'date') {
      // Try to parse natural date expressions
      const dateMatch = transcript.match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i);
      if (dateMatch) {
        const months: Record<string, string> = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04',
          'may': '05', 'june': '06', 'july': '07', 'august': '08',
          'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };
        const month = months[dateMatch[1].toLowerCase()] || '01';
        const day = dateMatch[2].padStart(2, '0');
        const year = dateMatch[3];
        processedValue = `${year}-${month}-${day}`;
      }
    }
    
    // Handle select fields - try to match options
    if (currentField.type === 'select' && currentField.options) {
      const lowerTranscript = transcript.toLowerCase();
      const matchedOption = currentField.options.find(opt => 
        lowerTranscript.includes(opt.label.toLowerCase()) ||
        lowerTranscript.includes(opt.value.toLowerCase())
      );
      if (matchedOption) {
        processedValue = matchedOption.value;
      }
    }
    
    // Handle phone numbers - extract digits
    if (currentField.type === 'phone') {
      processedValue = transcript.replace(/\D/g, '');
    }
    
    setPendingValue(processedValue);
    setAwaitingConfirmation(true);
  }, [currentField, isProcessing]);

  const voiceCommand = useVoiceCommand({
    onTranscript: (transcript, isFinal) => {
      // We run recognition continuously once started from the click gesture.
      // Only handle final results and de-dupe repeated finals.
      if (!isFinal) return;
      const t = transcript.trim();
      if (!t) return;
      if (t === lastHandledFinalRef.current) return;
      lastHandledFinalRef.current = t;
      processTranscript(t);
    },
    onError: (err) => {
      if (err === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
        setIsActive(false);
      }
    },
    // Keep the microphone session alive after the initial user gesture.
    continuous: true
  });

  const askCurrentField = useCallback(async () => {
    const idx = currentFieldIndexRef.current;
    const field = fields[idx];
    if (!field || !isActiveRef.current) return;
    if (awaitingConfirmationRef.current) return;

    setIsProcessing(true);
    await speak(field.question);
    setIsProcessing(false);
  }, [fields, speak]);

  // Confirm the current value and move to next field
  const confirmValue = useCallback(async () => {
    if (!currentField || !pendingValue) return;
    
    setIsProcessing(true);
    
    // Save the value
    setCapturedValues(prev => ({ ...prev, [currentField.key]: pendingValue }));
    onFieldCaptured(currentField.key, pendingValue);
    
    // Speak confirmation
    const displayValue = currentField.options?.find(o => o.value === pendingValue)?.label || pendingValue;
    await speak(`Got it. ${currentField.label}: ${displayValue}`);
    
    setAwaitingConfirmation(false);
    setPendingValue('');
    setIsProcessing(false);
    
    // Move to next field
    const nextIndex = currentFieldIndex + 1;
    if (nextIndex < fields.length) {
      setCurrentFieldIndex(nextIndex);
      // Immediately ask the next question (don't rely on effects).
      // Small delay helps avoid overlapping UI updates in some browsers.
      window.setTimeout(() => {
        void askCurrentField();
      }, 150);
    } else {
      // All fields complete
      await speak('All mandatory fields have been captured. You can review and submit.');
      onComplete();
      setIsActive(false);
    }
  }, [currentField, pendingValue, currentFieldIndex, fields.length, onFieldCaptured, onComplete, speak, askCurrentField]);

  // Retry current field
  const retryField = useCallback(async () => {
    setAwaitingConfirmation(false);
    setPendingValue('');
    if (currentField) {
      setIsProcessing(true);
      await speak(currentField.question);
      setIsProcessing(false);
    }
  }, [currentField, speak]);

  // Start the guided input
  const handleStart = useCallback(async () => {
    // CRITICAL: startListening must happen directly in the click handler on some browsers.
    voiceCommand.startListening();

    lastHandledFinalRef.current = '';
    setIsActive(true);
    setCurrentFieldIndex(0);
    setCapturedValues({});
    setAwaitingConfirmation(false);
    setPendingValue('');

    setIsProcessing(true);
    await speak('Let me help you fill in the required patient fields one by one.');
    setIsProcessing(false);

    await askCurrentField();
  }, [speak, voiceCommand, askCurrentField]);

  // Stop and close
  const handleClose = useCallback(() => {
    stopSpeech();
    voiceCommand.stopListening();
    setIsActive(false);
    setCurrentFieldIndex(0);
    setAwaitingConfirmation(false);
    setPendingValue('');
  }, [stopSpeech, voiceCommand]);

  // Safety: if we ever end up active but not speaking/listening/confirming for too long, re-ask.
  useEffect(() => {
    if (!isActive) return;
    if (awaitingConfirmation) return;
    if (isProcessing) return;
    if (voiceCommand.isListening) return;
    const t = window.setTimeout(() => {
      if (isActiveRef.current && !awaitingConfirmationRef.current && !isProcessingRef.current && !voiceCommand.isListening) {
        void askCurrentField();
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [isActive, awaitingConfirmation, isProcessing, voiceCommand.isListening, askCurrentField]);

  if (!voiceCommand.isSupported) {
    return null;
  }

  // Compact button when not active
  if (!isActive) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStart}
        className={cn(
          "gap-2 text-primary hover:text-primary hover:bg-primary/5 border-primary/20",
          className
        )}
      >
        <Mic className="h-4 w-4" />
        Voice Input
      </Button>
    );
  }

  return (
    <div className={cn(
      "border border-accent/30 rounded-lg bg-accent/5 p-4 space-y-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Volume2 className="h-5 w-5 text-accent" />
            {(voiceCommand.isListening || isProcessing) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-accent rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-sm font-medium text-accent">
            AI Voice Assistant
          </span>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(currentFieldIndex / fields.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {currentFieldIndex}/{fields.length}
        </span>
      </div>

      {/* Current Field */}
      {currentField && !isComplete && (
        <div className="space-y-3">
          {/* Question being asked */}
          <div className="flex items-start gap-2 bg-background rounded-lg p-3 border border-border">
            <Volume2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{currentField.question}</p>
              {currentField.options && (
                <p className="text-xs text-muted-foreground mt-1">
                  Options: {currentField.options.map(o => o.label).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Listening indicator */}
          {voiceCommand.isListening && !awaitingConfirmation && (
            <div className="flex items-center gap-2 text-accent">
              <Mic className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Listening... speak now</span>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && !awaitingConfirmation && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}

          {/* Pending value confirmation */}
          {awaitingConfirmation && pendingValue && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-lg p-3">
                <Check className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{currentField.label}</p>
                  <p className="text-sm font-medium text-foreground">
                    {currentField.options?.find(o => o.value === pendingValue)?.label || pendingValue}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="accent"
                  onClick={confirmValue}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Confirm & Next
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={retryField}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Captured Fields Summary */}
      {Object.keys(capturedValues).length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">Captured fields:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(capturedValues).map(([key, value]) => {
              const field = fields.find(f => f.key === key);
              const displayValue = field?.options?.find(o => o.value === value)?.label || value;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-success/10 text-success border border-success/20"
                >
                  <Check className="h-3 w-3" />
                  <span className="font-medium">{field?.label}:</span>
                  <span>{displayValue}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete state */}
      {isComplete && (
        <div className="flex items-center gap-2 text-success bg-success/10 rounded-lg p-3">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">All mandatory fields captured!</span>
        </div>
      )}
    </div>
  );
}
