import React, { useState } from 'react';
import { 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  CheckCircle2,
  Send,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface SmartRecommendationProps {
  onSubmit?: () => void;
}

const predefinedComments = [
  {
    id: '1',
    label: 'Normal NSR Finding',
    text: 'Normal sinus rhythm throughout the monitoring period. No significant arrhythmias detected. Heart rate variability within normal limits.',
    confidence: 95
  },
  {
    id: '2', 
    label: 'Tachycardia with Follow-up',
    text: 'Sinus tachycardia episodes noted during activity periods. Recommend lifestyle modifications and follow-up in 3 months.',
    confidence: 87
  },
  {
    id: '3',
    label: 'PVC Finding - Monitor',
    text: 'Isolated PVCs noted with burden within acceptable limits (<2%). Continue current management and monitor symptoms.',
    confidence: 92
  }
];

export const SmartRecommendation: React.FC<SmartRecommendationProps> = ({ onSubmit }) => {
  const [isAgreed, setIsAgreed] = useState<boolean | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAgree = () => {
    setIsAgreed(true);
    // Auto-select first recommendation
    setSelectedComment(predefinedComments[0].id);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F05A28', '#1D2B44', '#22c55e']
    });

    onSubmit?.();
  };

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Successfully Signed Off!
        </h3>
        <p className="text-muted-foreground">
          The report has been submitted and sent for final processing.
        </p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => {
            setIsSubmitted(false);
            setIsAgreed(null);
            setSelectedComment(null);
          }}
        >
          Review Another Report
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-accent" />
          Physician Agreement
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and confirm the study findings
        </p>
      </div>

      {/* Agreement Toggle */}
      <div className="p-4 border-b border-border">
        <p className="text-sm font-medium text-foreground mb-3">
          Do you agree with the study findings?
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAgree}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200
              ${isAgreed === true 
                ? 'border-success bg-success/10 text-success' 
                : 'border-border hover:border-success/50'
              }
            `}
          >
            <ToggleRight className="h-5 w-5" />
            <span className="font-medium">Agree</span>
          </button>
          <button
            onClick={() => setIsAgreed(false)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200
              ${isAgreed === false 
                ? 'border-destructive bg-destructive/10 text-destructive' 
                : 'border-border hover:border-destructive/50'
              }
            `}
          >
            <ToggleLeft className="h-5 w-5" />
            <span className="font-medium">Disagree</span>
          </button>
        </div>
      </div>

      {/* Smart Suggestion (only shows when Agreed) */}
      {isAgreed === true && (
        <div className="p-4 space-y-4 animate-fade-in">
          {/* AI Suggestion Header */}
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Smart Suggestion</span>
          </div>

          {/* Predefined Comments */}
          <div className="space-y-3">
            {predefinedComments.map((comment) => (
              <button
                key={comment.id}
                onClick={() => setSelectedComment(comment.id)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                  ${selectedComment === comment.id 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border hover:border-accent/30'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{comment.label}</span>
                  <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                    AI {comment.confidence}% confident
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {comment.text}
                </p>
              </button>
            ))}
          </div>

          {/* Confidence Meter */}
          {selectedComment && (
            <div className="p-4 bg-secondary/50 rounded-lg animate-scale-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">AI Confidence Score</span>
                <span className="text-sm font-bold text-success">
                  {predefinedComments.find(c => c.id === selectedComment)?.confidence}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full confidence-gradient rounded-full transition-all duration-500"
                  style={{ 
                    width: `${predefinedComments.find(c => c.id === selectedComment)?.confidence}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                AI is {predefinedComments.find(c => c.id === selectedComment)?.confidence}% confident this is a{' '}
                <span className="text-foreground font-medium">
                  {predefinedComments.find(c => c.id === selectedComment)?.label}
                </span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            disabled={!selectedComment}
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4 mr-2" />
            Sign & Submit
          </Button>
        </div>
      )}

      {/* Disagree Flow */}
      {isAgreed === false && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive font-medium mb-2">
              Disagreement Noted
            </p>
            <p className="text-sm text-muted-foreground">
              Please provide your clinical interpretation and reasoning for disagreement below.
            </p>
          </div>
          <textarea
            placeholder="Enter your clinical interpretation..."
            className="input-medical w-full h-32 resize-none"
          />
          <Button variant="accent" size="lg" className="w-full">
            Submit with Comments
          </Button>
        </div>
      )}
    </div>
  );
};
