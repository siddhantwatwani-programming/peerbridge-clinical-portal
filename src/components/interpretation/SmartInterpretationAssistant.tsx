import React, { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InterpretationAnalysis {
  recommendedComment: string;
  confidence: number;
  rationale: string;
  draftNarrative: string;
}

interface SmartInterpretationAssistantProps {
  studyFindings: string;
  patientName: string;
  studyType: string;
  onSelectComment: (commentValue: string) => void;
  onUseDraftNarrative: (narrative: string) => void;
}

export const SmartInterpretationAssistant: React.FC<SmartInterpretationAssistantProps> = ({
  studyFindings,
  patientName,
  studyType,
  onSelectComment,
  onUseDraftNarrative
}) => {
  const [analysis, setAnalysis] = useState<InterpretationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'agree' | 'disagree' | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('interpretation-assist', {
        body: { studyFindings, patientName, studyType }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching interpretation analysis:', err);
      setError('Failed to get AI analysis. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studyFindings) {
      fetchAnalysis();
    }
  }, [studyFindings]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High Confidence';
    if (confidence >= 70) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const handleApplyRecommendation = () => {
    if (analysis) {
      onSelectComment(analysis.recommendedComment);
      toast.success('AI recommendation applied');
    }
  };

  const handleUseDraft = () => {
    if (analysis) {
      onUseDraftNarrative(analysis.draftNarrative);
      toast.success('Draft narrative applied');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            AI Interpretation Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing study findings...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            AI Assistant Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAnalysis}>
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          AI Interpretation Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AI Confidence</span>
            <span className={cn('font-medium', getConfidenceColor(analysis.confidence))}>
              {analysis.confidence}% - {getConfidenceLabel(analysis.confidence)}
            </span>
          </div>
          <Progress value={analysis.confidence} className="h-2" />
        </div>

        {/* Recommended Comment */}
        <div className="p-3 bg-card rounded-lg border border-border">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-accent mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Comment</p>
              <p className="text-sm font-medium text-foreground">
                {analysis.recommendedComment === 'normal-nsr' && 'Normal sinus rhythm, no significant abnormalities'}
                {analysis.recommendedComment === 'nsr-pvc' && 'Normal sinus rhythm with rare PVCs'}
                {analysis.recommendedComment === 'sinus-tachy' && 'Sinus tachycardia noted, correlate clinically'}
                {analysis.recommendedComment === 'sinus-brady' && 'Sinus bradycardia noted, correlate clinically'}
                {analysis.recommendedComment === 'afib-detected' && 'Atrial fibrillation detected, recommend follow-up'}
              </p>
            </div>
          </div>
          <Button 
            variant="accent" 
            size="sm" 
            className="w-full mt-2"
            onClick={handleApplyRecommendation}
          >
            Apply Recommendation
          </Button>
        </div>

        {/* Rationale */}
        <div className="text-sm">
          <p className="text-xs font-medium text-muted-foreground mb-1">Clinical Rationale</p>
          <p className="text-foreground">{analysis.rationale}</p>
        </div>

        {/* Draft Narrative */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">AI Draft Narrative</p>
          <p className="text-sm text-foreground italic mb-3">"{analysis.draftNarrative}"</p>
          <Button variant="outline" size="sm" onClick={handleUseDraft}>
            Use This Draft
          </Button>
        </div>

        {/* Feedback */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <div className="flex gap-2">
            <Button
              variant={feedbackGiven === 'agree' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setFeedbackGiven('agree');
                toast.success('Thanks for your feedback!');
              }}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant={feedbackGiven === 'disagree' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setFeedbackGiven('disagree');
                toast.info('Thanks for your feedback. We\'ll improve.');
              }}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
