import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Mic, X, Check, Loader2, Volume2, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  onRegister?: () => void;
  className?: string;
}

type GuidedVoiceDraft = {
  v: 1;
  savedAt: number;
  currentFieldIndex: number;
  capturedValues: Record<string, string>;
};

export function GuidedVoiceInput({ 
  fields, 
  onFieldCaptured, 
  onComplete,
  onRegister,
  className 
}: GuidedVoiceInputProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [capturedValues, setCapturedValues] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  
  // Refs for async operations
  const isSpeakingRef = useRef(false);
  const isActiveRef = useRef(false);
  const currentFieldIndexRef = useRef(0);
  const hasProcessedCurrentFieldRef = useRef(false);
  const recognitionActiveRef = useRef(false);
  const ignoreTranscriptsUntilRef = useRef(0);
  const stopRequestedRef = useRef(false);

  const currentField = fields[currentFieldIndex];
  const isComplete = currentFieldIndex >= fields.length;

  const draftStorageKey = useMemo(() => {
    const keys = fields.map((f) => f.key).join('|');
    return `guided_voice_draft:v1:${keys}`;
  }, [fields]);

  // Sync refs
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { currentFieldIndexRef.current = currentFieldIndex; }, [currentFieldIndex]);

  // Text-to-speech
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const fallbackMs = Math.min(10000, Math.max(2500, Math.round(text.length * 50)));
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
        window.speechSynthesis.speak(utterance);
        
        setTimeout(settle, fallbackMs);
      } else {
        resolve();
      }
    });
  }, []);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
  }, []);

  // Process transcript and fill field immediately
  const processAndFillField = useCallback((transcript: string, fieldIndex: number) => {
    const field = fields[fieldIndex];
    if (!field) return;
    
    let processedValue = transcript.trim();
    
    // Handle date fields
    if (field.type === 'date') {
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
    
    // Handle select fields
    if (field.type === 'select' && field.options) {
      const lowerTranscript = transcript.toLowerCase();
      const matchedOption = field.options.find(opt => 
        lowerTranscript.includes(opt.label.toLowerCase()) ||
        lowerTranscript.includes(opt.value.toLowerCase())
      );
      if (matchedOption) {
        processedValue = matchedOption.value;
      }
    }
    
    // Handle phone numbers
    if (field.type === 'phone') {
      processedValue = transcript.replace(/\D/g, '');
    }
    
    // Save and fill immediately
    setCapturedValues(prev => ({ ...prev, [field.key]: processedValue }));
    onFieldCaptured(field.key, processedValue);
    
    return processedValue;
  }, [fields, onFieldCaptured]);

  const voiceCommand = useVoiceCommand({
    onTranscript: (transcript, isFinal) => {
      // CRITICAL: Ignore if AI is speaking to prevent capturing its own voice
      if (isSpeakingRef.current) {
        return;
      }

      // Ignore a short window AFTER speech ends (speaker echo)
      if (Date.now() < ignoreTranscriptsUntilRef.current) {
        return;
      }
      
      // Ignore if not active or already processed this field
      if (!isActiveRef.current || hasProcessedCurrentFieldRef.current) {
        return;
      }
      
      const t = transcript.trim();
      if (!t) return;
      
      // Show live transcript
      setCurrentTranscript(t);
      
      // Only process final results
      if (isFinal && t.length > 0) {
        hasProcessedCurrentFieldRef.current = true;
        setCurrentTranscript('');
        
        const fieldIndex = currentFieldIndexRef.current;
        const field = fields[fieldIndex];
        if (!field) return;
        
        const processedValue = processAndFillField(t, fieldIndex);
        const displayValue = field.options?.find(o => o.value === processedValue)?.label || processedValue;
        
        // Move to next field
        moveToNextField(displayValue || t, field.label);
      }
    },
    onError: (err) => {
      if (err === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
        setIsActive(false);
      }
    },
    continuous: true
  });

  // Speak while pausing recognition to avoid transcribing our own prompts
  const speakWithPause = useCallback(async (text: string) => {
    setIsProcessing(true);
    isSpeakingRef.current = true;
    voiceCommand.stopListening();

    try {
      await speak(text);
    } finally {
      isSpeakingRef.current = false;
      ignoreTranscriptsUntilRef.current = Date.now() + 800;
      setIsProcessing(false);

      if (isActiveRef.current && recognitionActiveRef.current && !stopRequestedRef.current) {
        setTimeout(() => {
          if (isActiveRef.current && recognitionActiveRef.current && !stopRequestedRef.current) {
            voiceCommand.startListening();
          }
        }, 150);
      }
    }
  }, [voiceCommand, speak]);

  // Move to next field
  const moveToNextField = useCallback(async (displayValue: string, fieldLabel: string) => {
    const nextIndex = currentFieldIndexRef.current + 1;

    // Brief confirmation
    await speakWithPause(`Got it. ${fieldLabel}: ${displayValue}`);

    if (nextIndex < fields.length) {
      setCurrentFieldIndex(nextIndex);
      hasProcessedCurrentFieldRef.current = false;

      // Ask next question
      setTimeout(async () => {
        if (!isActiveRef.current) return;
        await speakWithPause(fields[nextIndex].question);
      }, 200);
    } else {
      // All fields complete - show confirmation dialog
      await speakWithPause('All fields have been captured. Please review your information.');
      setShowConfirmDialog(true);
      onComplete();
    }
  }, [fields, speakWithPause, onComplete]);

  // Start the guided input
  const handleStart = useCallback(async () => {
    stopRequestedRef.current = false;

    // Start listening immediately on click (browser requirement)
    voiceCommand.startListening();
    recognitionActiveRef.current = true;
    
    // Reset state
    setIsActive(true);

    // Resume from draft if present
    let draft: GuidedVoiceDraft | null = null;
    try {
      const raw = sessionStorage.getItem(draftStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as GuidedVoiceDraft;
        if (parsed?.v === 1) draft = parsed;
      }
    } catch {
      // ignore
    }

    if (draft && Object.keys(draft.capturedValues || {}).length > 0) {
      const resumeIndex = Math.min(draft.currentFieldIndex || 0, fields.length);
      setCapturedValues(draft.capturedValues || {});
      setCurrentFieldIndex(resumeIndex);
      setShowConfirmDialog(false);
      setCurrentTranscript('');
      hasProcessedCurrentFieldRef.current = false;
      setHasDraft(false);

      // Hydrate parent form values immediately
      setTimeout(() => {
        Object.entries(draft!.capturedValues || {}).forEach(([k, v]) => onFieldCaptured(k, v));
      }, 0);

      if (resumeIndex < fields.length) {
        await speakWithPause(`Welcome back. ${fields[resumeIndex].question}`);
      } else {
        await speakWithPause('All fields were already captured. Please review your information.');
        setShowConfirmDialog(true);
        onComplete();
      }
      return;
    }

    setCurrentFieldIndex(0);
    setCapturedValues({});
    setShowConfirmDialog(false);
    setCurrentTranscript('');
    hasProcessedCurrentFieldRef.current = false;

    // Intro and first question
    await speakWithPause('I will ask you the required fields one by one. Please answer after each question.');
    if (fields.length > 0) {
      await speakWithPause(fields[0].question);
    }
  }, [voiceCommand, fields, speakWithPause, draftStorageKey, onFieldCaptured, onComplete]);

  // Close voice input
  const handleClose = useCallback(() => {
    stopRequestedRef.current = true;
    stopSpeech();
    voiceCommand.stopListening();
    recognitionActiveRef.current = false;
    setIsActive(false);
    setCurrentFieldIndex(0);
    setCurrentTranscript('');
    hasProcessedCurrentFieldRef.current = false;
  }, [stopSpeech, voiceCommand]);

  // Persist draft while active (so refresh can resume)
  useEffect(() => {
    if (!isActive) return;
    const draft: GuidedVoiceDraft = {
      v: 1,
      savedAt: Date.now(),
      currentFieldIndex,
      capturedValues,
    };
    try {
      sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [isActive, currentFieldIndex, capturedValues, draftStorageKey]);

  // Detect an existing draft (so the button can say "Resume")
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftStorageKey);
      if (!raw) {
        setHasDraft(false);
        return;
      }
      const parsed = JSON.parse(raw) as GuidedVoiceDraft;
      setHasDraft(!!parsed?.capturedValues && Object.keys(parsed.capturedValues).length > 0);
    } catch {
      setHasDraft(false);
    }
  }, [draftStorageKey]);

  // Back to editing from confirmation
  const handleBackToEditing = useCallback(() => {
    setShowConfirmDialog(false);
    handleClose();
  }, [handleClose]);

  // Register patient
  const handleRegister = useCallback(() => {
    setShowConfirmDialog(false);
    try {
      sessionStorage.removeItem(draftStorageKey);
    } catch {
      // ignore
    }
    handleClose();
    if (onRegister) {
      onRegister();
    }
  }, [handleClose, onRegister, draftStorageKey]);

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
        {hasDraft ? 'Resume Voice Input' : 'Voice Input'}
      </Button>
    );
  }

  return (
    <>
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
            {Math.min(currentFieldIndex + 1, fields.length)}/{fields.length}
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

            {/* Live transcript */}
            {currentTranscript && (
              <div className="flex items-center gap-2 text-primary bg-primary/5 rounded-lg p-2">
                <Mic className="h-4 w-4 animate-pulse" />
                <span className="text-sm italic">"{currentTranscript}"</span>
              </div>
            )}

            {/* Listening indicator */}
            {voiceCommand.isListening && !currentTranscript && !isProcessing && (
              <div className="flex items-center gap-2 text-accent">
                <Mic className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Listening... speak now</span>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Speaking...</span>
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
                    <span className="max-w-[100px] truncate">{displayValue}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-4 w-4 text-success" />
              </div>
              Review Patient Information
            </DialogTitle>
            <DialogDescription>
              Please review the captured information before registering the patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {fields.map((field) => {
              const value = capturedValues[field.key];
              const displayValue = field.options?.find(o => o.value === value)?.label || value;
              return (
                <div key={field.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  <span className="text-sm font-medium text-foreground">
                    {displayValue || <span className="text-muted-foreground italic">Not provided</span>}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="accent" 
              className="w-full gap-2" 
              onClick={handleRegister}
            >
              <Check className="h-4 w-4" />
              Confirm & Register Patient
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={handleBackToEditing}
            >
              <Pencil className="h-4 w-4" />
              Back to Editing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
