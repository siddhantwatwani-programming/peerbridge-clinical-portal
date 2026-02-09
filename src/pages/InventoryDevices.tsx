import React, { useState } from 'react';
import { Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InventoryPredictionPanel from '@/components/inventory/InventoryPredictionPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const InventoryDevices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.serviceTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(device.status);
    
    return matchesSearch && matchesStatus;
  });

  const totalResults = filteredDevices.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-foreground">Inventory Devices</h1>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-medical w-full pl-11 py-3"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter Status ({statusFilters.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border border-border z-50">
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes('Assigned')}
              onCheckedChange={() => toggleStatusFilter('Assigned')}
            >
              Assigned
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes('Retired')}
              onCheckedChange={() => toggleStatusFilter('Retired')}
            >
              Retired
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes('Unavailable')}
              onCheckedChange={() => toggleStatusFilter('Unavailable')}
            >
              Unavailable
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* AI Prediction Engine */}
      <InventoryPredictionPanel devices={devices} />

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    USE BY DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    SERVICE TAG
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    FIRST NAME
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    LAST NAME
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    SKU
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    STATUS
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    PRODUCT NAME
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr key={device.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm text-foreground">{device.useByDate}</td>
                  <td className="p-4 text-sm text-primary font-medium">{device.serviceTag}</td>
                  <td className="p-4 text-sm text-foreground">{device.firstName}</td>
                  <td className="p-4 text-sm text-foreground">{device.lastName}</td>
                  <td className="p-4 text-sm text-foreground">{device.sku}</td>
                  <td className="p-4 text-sm text-foreground">{device.status}</td>
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

export default InventoryDevices;
