import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Send } from 'lucide-react';

interface Transmission {
  id: string;
  patient: string;
  received: string;
}

const transmissions: Transmission[] = [
  { id: '1', patient: 'Joel Larson', received: '08/12/2025 -08:18:23 PM' },
];

interface TransmissionsTableProps {
  onPreviewReport: () => void;
}

export const TransmissionsTable: React.FC<TransmissionsTableProps> = ({ onPreviewReport }) => {
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
                RECEIVED ↕
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {transmissions.map((transmission) => (
              <tr key={transmission.id} className="table-row-hover border-b border-border last:border-0">
                <td className="p-4 text-sm font-medium text-primary">
                  {transmission.patient}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {transmission.received}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="accent" size="sm" onClick={onPreviewReport}>
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
