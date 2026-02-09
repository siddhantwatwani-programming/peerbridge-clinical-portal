import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
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

const statusVariantMap: Record<string, 'success' | 'muted' | 'warning'> = {
  'Assigned': 'success',
  'Retired': 'muted',
  'Unavailable': 'warning',
};

const InventoryDevices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.serviceTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(device.status);
    return matchesSearch && matchesStatus;
  });

  const totalResults = filteredDevices.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const columns = [
    { key: 'serviceTag', label: 'Service Tag', sortable: true, render: (d: Device) => (
      <span className="font-mono text-xs font-medium text-accent">{d.serviceTag}</span>
    )},
    { key: 'productName', label: 'Product', sortable: true, render: (d: Device) => (
      <span className="font-medium text-foreground">{d.productName}</span>
    )},
    { key: 'patient', label: 'Patient', sortable: true, render: (d: Device) => (
      <span className="text-foreground">{d.firstName} {d.lastName}</span>
    )},
    { key: 'sku', label: 'SKU', sortable: true, render: (d: Device) => (
      <span className="text-muted-foreground font-mono text-xs">{d.sku}</span>
    )},
    { key: 'status', label: 'Status', render: (d: Device) => (
      <StatusBadge label={d.status} variant={statusVariantMap[d.status] || 'default'} />
    )},
    { key: 'useByDate', label: 'Use By', sortable: true, render: (d: Device) => (
      <span className="text-muted-foreground text-xs tabular-nums">{d.useByDate}</span>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader title="Inventory Devices" subtitle={`${devices.length} devices tracked`} />

      <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search devices...">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 text-xs">
              <Filter className="h-3.5 w-3.5" />
              Status {statusFilters.length > 0 && `(${statusFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {['Assigned', 'Retired', 'Unavailable'].map(s => (
              <DropdownMenuCheckboxItem key={s} checked={statusFilters.includes(s)} onCheckedChange={() => setStatusFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}>
                {s}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchToolbar>

      <InventoryPredictionPanel devices={devices} />

      <ModernTable columns={columns} data={filteredDevices} keyExtractor={(d) => d.id} emptyMessage="No devices found" />

      <ModernPagination currentPage={currentPage} totalPages={totalPages} totalResults={totalResults} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default InventoryDevices;
