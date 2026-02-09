import React, { useState } from 'react';
import { Sparkles, Plus, Loader2, Brain, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ICDSuggestion {
  code: string;
  description: string;
  confidence: number;
  rationale: string;
}

interface ICD10AutoSuggestProps {
  onSelectCode: (code: { code: string; description: string }) => void;
  selectedCodes: Array<{ code: string; description: string }>;
}

export const ICD10AutoSuggest: React.FC<ICD10AutoSuggestProps> = ({ onSelectCode, selectedCodes }) => {
  const [symptoms, setSymptoms] = useState('');
  const [suggestions, setSuggestions] = useState<ICDSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe the patient symptoms first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('icd10-suggest', {
        body: { symptoms: symptoms.trim() }
      });

      if (fnError) throw fnError;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else if (data?.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('ICD-10 suggest error:', err);
      setError('Failed to get suggestions. Please try again.');
      toast.error('Failed to get ICD-10 suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAlreadySelected = (code: string) =>
    selectedCodes.some(c => c.code === code);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400';
    if (confidence >= 65) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="space-y-3">
      {/* AI Input Area */}
      <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Brain className="h-4 w-4 text-primary" />
          AI-Powered ICD-10 Lookup
        </div>

        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder='Describe symptoms in natural language, e.g. "patient reports palpitations, dizziness, and occasional shortness of breath"'
          className="min-h-[72px] bg-background text-sm resize-none"
        />

        <Button
          onClick={handleSuggest}
          disabled={isLoading || !symptoms.trim()}
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {isLoading ? 'Analyzing…' : 'Suggest ICD-10 Codes'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            AI Suggestions — click to add
          </p>
          {suggestions.map((s, i) => {
            const selected = isAlreadySelected(s.code);
            return (
              <button
                key={`${s.code}-${i}`}
                disabled={selected}
                onClick={() => onSelectCode({ code: s.code, description: s.description })}
                className={`w-full text-left rounded-lg border p-3 transition-all group ${
                  selected
                    ? 'border-border/40 bg-muted/40 opacity-60 cursor-default'
                    : 'border-border/60 bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-primary">{s.code}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getConfidenceColor(s.confidence)}`}>
                        {s.confidence}%
                      </span>
                      {selected && (
                        <span className="text-[11px] text-muted-foreground">Added</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{s.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.rationale}</p>
                  </div>
                  {!selected && (
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
