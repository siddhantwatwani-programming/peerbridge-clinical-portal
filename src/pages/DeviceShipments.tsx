import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Package } from 'lucide-react';
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
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Device Shipments</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalResults} shipments</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl text-accent border-accent hover:bg-accent/10">
          <Package className="h-4 w-4" />
          Inbound Shipment
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search shipments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-medical w-full pl-11" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['To', 'From', 'Shipping Date', 'Status'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">{h}<ArrowUpDown className="h-3 w-3" /></button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-border/40 last:border-0 hover:bg-accent/[0.03] transition-colors">
                  <td className="p-4 text-sm text-foreground font-medium">{shipment.to}</td>
                  <td className="p-4 text-sm text-foreground">{shipment.from}</td>
                  <td className="p-4 text-sm text-muted-foreground">{shipment.shippingDate}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">{shipment.status}</span>
                  </td>
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
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
            <Button key={page} variant={currentPage === page ? "default" : "ghost"} size="icon" className={`h-8 w-8 rounded-lg ${currentPage === page ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`} onClick={() => setCurrentPage(page)}>{page}</Button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceShipments;
