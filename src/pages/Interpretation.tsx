import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface StudyInfo {
  patientName: string;
  serviceTag: string;
  studyType: string;
  studyDates: string;
  reportId?: string;
}

const studyFindingsSummary = `The study duration was 6d 23h 38m.

The patient's baseline rhythm was Sinus Rhythm.

The average heart rate was 79 bpm with a minimum of 49 bpm and maximum of 194 bpm.

Total Ventricular Ectopy was 1 representing 0.00% of total beats.

There were 0 Couplets and 0 Triplets noted.

There were 0 episodes of Bigeminy and 0 episodes of Trigeminy.

There were 0 VT runs.

Total Supraventricular Ectopy was 25 representing 0.00% of total beats.

There were 0 SV Couplets and 0 SV Triplets noted.

There were 0 episodes of Atrial Bigeminy and 0 episodes of Atrial Trigeminy.

There were 0 SV runs.

Total AFIB episodes was 0.

Total Pauses was 0.`;

const predefinedComments = [
  { value: 'normal-nsr', label: 'Normal sinus rhythm, no significant abnormalities' },
  { value: 'nsr-pvc', label: 'Normal sinus rhythm with rare PVCs' },
  { value: 'sinus-tachy', label: 'Sinus tachycardia noted, correlate clinically' },
  { value: 'sinus-brady', label: 'Sinus bradycardia noted, correlate clinically' },
  { value: 'afib-detected', label: 'Atrial fibrillation detected, recommend follow-up' },
];

interface LocationState {
  patientName?: string;
  studyType?: string;
  serviceTag?: string;
  studyDates?: string;
  reportId?: string;
}

const Interpretation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [studyInfo] = useState<StudyInfo>({
    patientName: state?.patientName || 'Mike Kam',
    serviceTag: state?.serviceTag || 'VBG8S0QQCO',
    studyType: state?.studyType || '7 Day XT Holter',
    studyDates: state?.studyDates || '07/08/2025 -04:02:08 AM - 07/09/2025 -04:01:14 AM',
    reportId: state?.reportId
  });

  const [agreementStatus, setAgreementStatus] = useState<string>('agree');
  const [selectedComment, setSelectedComment] = useState<string>('');
  const [professionalComments, setProfessionalComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signatureInfo = {
    signedBy: 'Site Admin',
    signedDate: new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).replace(',', ' -')
  };

  const handleUpdatePDF = () => {
    toast.success('PDF updated successfully!', {
      description: 'The report PDF has been refreshed with the latest data.'
    });
  };

  const handleSignAndSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Report signed and submitted successfully!', {
        description: 'The interpretation has been recorded.'
      });

      setIsSubmitting(false);

      // Redirect to dashboard after a brief delay for the user to see confetti
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    }, 1000);
  };

  const pdfUrl = '/reports/sample-report.pdf';

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-primary">Physician Interpretation</h1>

      {/* Patient Info Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              PATIENT NAME
            </p>
            <p className="text-lg font-semibold text-foreground">{studyInfo.patientName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              SERVICE TAG
            </p>
            <p className="text-lg font-semibold text-foreground">{studyInfo.serviceTag}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              STUDY TYPE
            </p>
            <p className="text-lg font-semibold text-foreground">{studyInfo.studyType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              STUDY DATES
            </p>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {studyInfo.studyDates}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Left = findings + form, Right = PDF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Study Findings Summary */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Study Findings Summary from report
            </h2>
            <div className="border border-border rounded-lg bg-background">
              <Textarea
                value={studyFindingsSummary}
                readOnly
                className="min-h-[280px] resize-y border-0 bg-transparent text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Agreement & Comments */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Do you agree with study findings? <span className="text-destructive">*</span>
                </label>
                <Select value={agreementStatus} onValueChange={setAgreementStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agreement status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agree">Yes, I agree</SelectItem>
                    <SelectItem value="disagree">No, I disagree</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Additional Comments (Pre-populated)
                </label>
                <Select value={selectedComment} onValueChange={setSelectedComment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional predefined comments" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedComments.map((comment) => (
                      <SelectItem key={comment.value} value={comment.value}>
                        {comment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Professional Comments / Narrative
              </label>
              <Textarea
                value={professionalComments}
                onChange={(e) => setProfessionalComments(e.target.value)}
                placeholder="Enter your professional comments and narrative..."
                className="min-h-[120px] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Column - PDF Viewer */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">PDF Report</h2>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Open in New Tab <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex-1 min-h-[500px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[500px] rounded-b-xl"
              title="PDF Report"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between">
        {/* Signature Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-success" />
          <span>
            Electronically signed by <strong className="text-foreground">{signatureInfo.signedBy}</strong> on{' '}
            <strong className="text-foreground">{signatureInfo.signedDate}</strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleUpdatePDF}
            className="border-accent text-accent hover:bg-accent/10"
          >
            Update PDF
          </Button>
          <Button
            variant="accent"
            onClick={handleSignAndSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Sign & Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Interpretation;
