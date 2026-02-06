import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Study {
  id: string;
  patient: string;
  studyType: string;
  orderStatus: string;
  startDate: string;
}

const studies: Study[] = [
  { id: '1', patient: 'Mike Kam', studyType: '7 Day XT Holter', orderStatus: 'Active', startDate: '07/08/2025' },
  { id: '2', patient: 'Ravii Choudhary', studyType: '7 Day XT Holter', orderStatus: 'Pending', startDate: '07/29/2025' },
  { id: '3', patient: 'Joel Larson', studyType: '14 Day MCT', orderStatus: 'Active', startDate: '08/01/2025' },
];

export const ActiveStudiesTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20">
              {['Patient', 'Study Type', 'Order Status', 'Start Date'].map((header) => (
                <th key={header} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    {header}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                </td>
              </tr>
            ) : (
              studies.map((study) => (
                <tr key={study.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">
                    {study.patient}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {study.studyType}
                  </td>
                  <td className="p-4">
                    <Badge variant={study.orderStatus === 'Active' ? 'default' : 'secondary'} className="rounded-lg text-xs font-medium">
                      {study.orderStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {study.startDate}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
