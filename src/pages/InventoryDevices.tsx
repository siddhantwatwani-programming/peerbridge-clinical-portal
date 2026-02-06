import React, { useState } from 'react';
import { Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Device {
  id: string;
  useByDate: string;
  serviceTag: string;
  firstName: string;
  lastName: string;
  sku: string;
  status: 'Retired' | 'Assigned' | 'Unavailable';
  productName: string;
}

const devices: Device[] = [
  { id: '1', useByDate: 'Jan 25, 2025', serviceTag: 'JMT0DOVRP39', firstName: 'Danie', lastName: 'Danie', sku: 'FP-20247', status: 'Retired', productName: 'Peerbridge Cor XT ™' },
  { id: '2', useByDate: 'Jan 26, 2025', serviceTag: 'JMT0DP5RAH1', firstName: 'TestJulyTwentySix', lastName: 'TestJulyTwentySix', sku: 'FP-20247', status: 'Assigned', productName: 'Peerbridge Cor XT ™' },
  { id: '3', useByDate: 'Jan 26, 2025', serviceTag: 'JMT9T273MZC', firstName: 'Mike', lastName: 'Kam', sku: 'FP-20247', status: 'Retired', productName: 'Peerbridge Cor XT ™' },
  { id: '4', useByDate: 'Jan 27, 2025', serviceTag: 'JMT5T0XX3XX', firstName: 'Mike', lastName: 'Kam', sku: 'FP-20247', status: 'Assigned', productName: 'Peerbridge Cor XT ™' },
  { id: '5', useByDate: 'Jan 27, 2025', serviceTag: 'JMT8LNIMFNS', firstName: 'TestJulyTwentySix', lastName: 'TestJulyTwentySix', sku: 'FP-20247', status: 'Retired', productName: 'Peerbridge Cor XT ™' },
  { id: '6', useByDate: 'Jan 30, 2025', serviceTag: 'JMT5T17V860', firstName: 'Mike', lastName: 'Kam', sku: 'FP-20248', status: 'Unavailable', productName: 'Peerbridge Cor Event ™' },
  { id: '7', useByDate: 'Feb 1, 2025', serviceTag: 'JMT1YX20V1X', firstName: 'TestJulyTwentySix', lastName: 'TestJulyTwentySix', sku: 'FP-20248', status: 'Assigned', productName: 'Peerbridge Cor Event ™' },
  { id: '8', useByDate: 'Feb 26, 2025', serviceTag: 'JMSSVDNC6H1', firstName: 'Mike', lastName: 'Kam', sku: 'FP-20248', status: 'Assigned', productName: 'Peerbridge Cor Event ™' },
];

const statusStyles: Record<string, string> = {
  'Assigned': 'bg-accent/10 text-accent',
  'Retired': 'bg-muted text-muted-foreground',
  'Unavailable': 'bg-destructive/10 text-destructive',
};

const InventoryDevices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.serviceTag.toLowerCase().includes(searchQuery.toLowerCase()) || device.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || device.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || device.sku.toLowerCase().includes(searchQuery.toLowerCase()) || device.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(device.status);
    return matchesSearch && matchesStatus;
  });

  const totalResults = filteredDevices.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const toggleStatusFilter = (status: string) => { setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Inventory Devices</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalResults} devices</p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search devices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-medical w-full pl-11" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl border-border">
              <Filter className="h-4 w-4" />
              Filter Status ({statusFilters.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {['Assigned', 'Retired', 'Unavailable'].map(status => (
              <DropdownMenuCheckboxItem key={status} checked={statusFilters.includes(status)} onCheckedChange={() => toggleStatusFilter(status)}>
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Use By Date', 'Service Tag', 'First Name', 'Last Name', 'SKU', 'Status', 'Product Name'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">{h}<ArrowUpDown className="h-3 w-3" /></button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr key={device.id} className="border-b border-border/40 last:border-0 hover:bg-accent/[0.03] transition-colors">
                  <td className="p-4 text-sm text-muted-foreground">{device.useByDate}</td>
                  <td className="p-4 text-sm text-accent font-medium">{device.serviceTag}</td>
                  <td className="p-4 text-sm text-foreground">{device.firstName}</td>
                  <td className="p-4 text-sm text-foreground">{device.lastName}</td>
                  <td className="p-4 text-sm text-muted-foreground">{device.sku}</td>
                  <td className="p-4 text-sm">
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", statusStyles[device.status] || 'bg-muted text-muted-foreground')}>
                      {device.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">{device.productName}</td>
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

export default InventoryDevices;
