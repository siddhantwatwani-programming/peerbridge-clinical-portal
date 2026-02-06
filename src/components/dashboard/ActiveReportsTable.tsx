import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Send } from 'lucide-react';

interface Report {
  id: string;
  patient: string;
  studyType: string;
  startDate: string;
  serviceTag: string;
  studyDates: string;
}

const reports: Report[] = [
  { 
    id: '1', 
    patient: 'Mike Kam', 
    studyType: '7 Day XT Holter', 
    startDate: '07/08/2025',
    serviceTag: 'VBG8S0QQCO',
    studyDates: '07/08/2025 -04:02:08 AM - 07/09/2025 -04:01:14 AM'
  },
  { 
    id: '2', 
    patient: 'Ravii Choudhary', 
    studyType: '7 Day XT Holter', 
    startDate: '07/29/2025',
    serviceTag: 'XYZ123ABC',
    studyDates: '07/29/2025 -10:15:00 AM - 08/05/2025 -10:14:00 AM'
  },
];

interface ActiveReportsTableProps {
  onPreviewReport: (report: Report) => void;
}

export const ActiveReportsTable: React.FC<ActiveReportsTableProps> = ({ onPreviewReport }) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                PATIENT ↕
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                STUDY TYPE ↕
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                STUDY BEGIN DATE ↕
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="table-row-hover border-b border-border last:border-0">
                <td className="p-4 text-sm font-medium text-primary">
                  {report.patient}
                </td>
                <td className="p-4 text-sm text-foreground">
                  {report.studyType}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {report.startDate}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="accent" size="sm" onClick={() => onPreviewReport(report)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Preview Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-1" />
                      Send to history
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
