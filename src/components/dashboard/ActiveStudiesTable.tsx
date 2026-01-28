import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';

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
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  PATIENT
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  STUDY TYPE
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  ORDER STATUS
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  START DATE
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                </td>
              </tr>
            ) : (
              studies.map((study) => (
                <tr key={study.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-primary">
                    {study.patient}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {study.studyType}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {study.orderStatus}
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
