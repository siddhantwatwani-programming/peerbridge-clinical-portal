import React from 'react';
import { Download, Printer, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  patient: string;
  received: string;
}

const events: Event[] = [
  { id: '1', patient: 'Joel Larson', received: '08/12/2025 -08:18:23 PM' },
  { id: '2', patient: 'Mike Kam', received: '05/10/2025 -05:52:55 AM' },
  { id: '3', patient: 'Mike Kam', received: '05/10/2025 -05:49:01 AM' },
  { id: '4', patient: 'TestJulyTwentySix TestJulyTwentySix', received: '08/02/2024 -09:39:21 PM' },
  { id: '5', patient: 'TestJulyTwentySix TestJulyTwentySix', received: '08/02/2024 -09:04:23 PM' },
  { id: '6', patient: 'TestJulyTwentySix TestJulyTwentySix', received: '08/02/2024 -08:46:15 PM' },
  { id: '7', patient: 'TestJulyTwentySix TestJulyTwentySix', received: '08/02/2024 -08:41:33 PM' },
  { id: '8', patient: 'TestJulyTwentySix TestJulyTwentySix', received: '08/02/2024 -09:04:23 PM' },
  { id: '9', patient: 'TestJulyTwentySix TestJulyTwentySix', received: '08/02/2024 -08:45:46 PM' },
];

export const ActiveEventsTable: React.FC = () => {
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
                  RECEIVED
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-4 text-sm font-medium text-primary">
                  {event.patient}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {event.received}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10">
                      <Printer className="h-4 w-4" />
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
