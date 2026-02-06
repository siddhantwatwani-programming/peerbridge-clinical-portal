import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Shipment {
  id: string;
  to: string;
  from: string;
  shippingDate: string;
  status: string;
}

const shipments: Shipment[] = [
  { id: '1', to: 'Dev Clinic', from: 'siteOne', shippingDate: '07/27/2024 -12:02:25 AM', status: 'InPreparation' },
  { id: '2', to: 'Dev Clinic', from: 'siteOne', shippingDate: '08/04/2024 -03:32:29 AM', status: 'InPreparation' },
  { id: '3', to: 'Dev Clinic', from: 'siteOne', shippingDate: '07/29/2024 -11:54:07 PM', status: 'InPreparation' },
];

const DeviceShipments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredShipments = shipments.filter(shipment => 
    shipment.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResults = filteredShipments.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Device Shipments</h1>
        
        <Button 
          variant="outline" 
          className="text-accent border-accent hover:bg-accent/10"
        >
          Inbound Shipment
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-medical w-full pl-11 py-3"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    TO
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    FROM
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    SHIPPING DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    STATUS
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm text-foreground">{shipment.to}</td>
                  <td className="p-4 text-sm text-foreground">{shipment.from}</td>
                  <td className="p-4 text-sm text-muted-foreground">{shipment.shippingDate}</td>
                  <td className="p-4 text-sm text-foreground">{shipment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing 1 to {Math.min(itemsPerPage, totalResults)} of {totalResults} results</span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 ${currentPage === page ? 'bg-muted text-foreground' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceShipments;
