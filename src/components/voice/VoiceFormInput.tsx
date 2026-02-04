import React, { useState, useCallback } from 'react';
import { Mic, MicOff, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceFormParser, FieldSchema } from '@/hooks/useVoiceFormParser';

interface VoiceFormInputProps {
  context: 'patient_registration' | 'order_creation';
  fields: FieldSchema[];
  onFieldsParsed: (data: Record<string, string>) => void;
  className?: string;
}

export function VoiceFormInput({ 
  context, 
  fields, 
  onFieldsParsed, 
  className 
}: VoiceFormInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldsParsed = useCallback((parsedFields: Record<string, string>, confidence: Record<string, number>) => {
    // Filter out empty values and pass to parent
    const nonEmptyFields: Record<string, string> = {};
    Object.entries(parsedFields).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        nonEmptyFields[key] = value;
      }
    });
    onFieldsParsed(nonEmptyFields);
  }, [onFieldsParsed]);

  const {
    isListening,
    isSupported,
    transcript,
    isParsing,
    parsedFields,
    confidence,
    error,
    startListening,
    stopListening,
    reset
  } = useVoiceFormParser({
    context,
    fieldSchema: fields,
    onFieldsParsed: handleFieldsParsed
  });

  const handleToggle = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
      startListening();
    } else if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isExpanded, isListening, startListening, stopListening]);

  const handleClose = useCallback(() => {
    stopListening();
    setIsExpanded(false);
    reset();
  }, [stopListening, reset]);

  if (!isSupported) {
    return null;
  }

  // Compact button when not expanded
  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleToggle}
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

  // Get parsed field entries for display
  const parsedEntries = Object.entries(parsedFields).filter(([_, value]) => value && value.trim() !== '');

  return (
    <div className={cn(
      "border border-primary/20 rounded-lg bg-primary/5 p-4 space-y-3",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isListening ? (
            <>
              <div className="relative">
                <Mic className="h-5 w-5 text-accent" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-accent rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-medium text-accent">Listening...</span>
            </>
          ) : isParsing ? (
            <>
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">Processing...</span>
            </>
          ) : (
            <>
              <MicOff className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Paused</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isListening && !isParsing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startListening}
              className="text-primary hover:text-primary"
            >
              <Mic className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          {isListening && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={stopListening}
              className="text-muted-foreground hover:text-foreground"
            >
              Stop
            </Button>
          )}
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
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="bg-background/50 rounded-md p-3 border border-border">
          <p className="text-sm text-foreground italic">"{transcript}"</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Parsed Fields */}
      {parsedEntries.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Parsed Fields:</p>
          <div className="flex flex-wrap gap-2">
            {parsedEntries.map(([key, value]) => {
              const fieldDef = fields.find(f => f.key === key);
              const fieldConfidence = confidence[key] || 0;
              const isHighConfidence = fieldConfidence >= 0.7;
              
              return (
                <span
                  key={key}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                    isHighConfidence 
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-warning/10 text-warning border border-warning/20"
                  )}
                >
                  <Check className="h-3 w-3" />
                  <span className="font-medium">{fieldDef?.label || key}:</span>
                  <span>{value}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!transcript && !parsedEntries.length && isListening && (
        <p className="text-xs text-muted-foreground">
          {context === 'patient_registration' 
            ? 'Say patient details like: "John Smith, born January 15 1985, MRN 12345, male, phone 555-123-4567"'
            : 'Say order details like: "14 day study, patient has a pacemaker, ordering physician Dr. Smith"'
          }
        </p>
      )}
    </div>
  );
}
