import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SortDirection = 'asc' | 'desc' | null;

interface Study {
  id: string;
  patient: string;
  studyType: string;
  orderStatus: string;
  doctor: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  totalDays: number;
}

const activeStudiesData: Study[] = [
  { id: '1', patient: 'Mike Kam', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Michael Kaminski', startDate: '01/27/2026', endDate: '01/28/2026', remainingDays: 1, totalDays: 1 },
  { id: '2', patient: 'Mike Kam', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Michael Kaminski', startDate: '01/27/2026', endDate: '01/28/2026', remainingDays: 1, totalDays: 1 },
  { id: '3', patient: 'NewApp Testing', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Prashant Kumar', startDate: '01/27/2026', endDate: '01/28/2026', remainingDays: 1, totalDays: 1 },
  { id: '4', patient: 'Tom Ford', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Phisician User', startDate: '01/24/2026', endDate: '01/25/2026', remainingDays: 1, totalDays: 1 },
  { id: '5', patient: 'Mike Kam', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Phisician User', startDate: '01/24/2026', endDate: '01/25/2026', remainingDays: 1, totalDays: 1 },
  { id: '6', patient: 'pk km', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Phisician User', startDate: '01/24/2026', endDate: '01/25/2026', remainingDays: 1, totalDays: 1 },
  { id: '7', patient: 'NewApp Testing', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Prashant Kumar', startDate: '01/23/2026', endDate: '01/24/2026', remainingDays: 1, totalDays: 1 },
  { id: '8', patient: 'Mobile Decfourteen', studyType: '14 Day XT', orderStatus: 'Ready To Start', doctor: 'Prashant Kumar', startDate: '01/23/2026', endDate: '02/06/2026', remainingDays: 14, totalDays: 14 },
  { id: '9', patient: 'Tom Ford', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Phisician User', startDate: '01/22/2026', endDate: '01/23/2026', remainingDays: 1, totalDays: 1 },
  { id: '10', patient: 'Mobile Decfourteen', studyType: '24 Hours Holter', orderStatus: 'Ready To Start', doctor: 'Prashant Kumar', startDate: '01/22/2026', endDate: '01/23/2026', remainingDays: 1, totalDays: 1 },
  { id: '11', patient: 'Sarah Johnson', studyType: '48 Hours Holter', orderStatus: 'In Progress', doctor: 'Michael Kaminski', startDate: '01/21/2026', endDate: '01/23/2026', remainingDays: 2, totalDays: 2 },
  { id: '12', patient: 'James Wilson', studyType: '7 Day Event', orderStatus: 'Ready To Start', doctor: 'Prashant Kumar', startDate: '01/20/2026', endDate: '01/27/2026', remainingDays: 7, totalDays: 7 },
];

const historicalStudiesData: Study[] = [
  { id: '1', patient: 'TestJulyTwentySix TestJulyTwentySix', studyType: 'New Type', orderStatus: 'Monitoring Complete', doctor: 'Michael Kaminski', startDate: '08/02/2024', endDate: '08/03/2024', remainingDays: 0, totalDays: 10 },
];

const allDoctors = [...new Set([...activeStudiesData, ...historicalStudiesData].map(s => s.doctor))];

const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'info' | 'muted'> = {
  'Ready To Start': 'default',
  'In Progress': 'info',
  'Monitoring Complete': 'success',
};

const Studies: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'active' | 'historical'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentData = viewMode === 'active' ? activeStudiesData : historicalStudiesData;

  const filteredAndSortedData = useMemo(() => {
    let result = [...currentData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.patient.toLowerCase().includes(q) || s.studyType.toLowerCase().includes(q) || s.doctor.toLowerCase().includes(q));
    }
    if (selectedDoctors.length > 0) result = result.filter(s => selectedDoctors.includes(s.doctor));
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortColumn];
        const bVal = (b as any)[sortColumn];
        if (typeof aVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [currentData, searchQuery, selectedDoctors, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortColumn(null);
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const columns = [
    { key: 'patient', label: 'Patient', sortable: true, render: (s: Study) => (
      <span className="font-medium text-accent hover:underline">{s.patient}</span>
    )},
    { key: 'studyType', label: 'Study Type', sortable: true, render: (s: Study) => (
      <span className="text-foreground">{s.studyType}</span>
    )},
    { key: 'orderStatus', label: 'Status', sortable: true, render: (s: Study) => (
      <StatusBadge label={s.orderStatus} variant={statusVariantMap[s.orderStatus] || 'default'} />
    )},
    { key: 'doctor', label: 'Doctor', sortable: true, render: (s: Study) => (
      <span className="text-muted-foreground">{s.doctor}</span>
    )},
    { key: 'startDate', label: 'Start', sortable: true, render: (s: Study) => (
      <span className="text-muted-foreground tabular-nums text-xs">{s.startDate}</span>
    )},
    { key: 'endDate', label: 'End', sortable: true, render: (s: Study) => (
      <span className="text-muted-foreground tabular-nums text-xs">{s.endDate}</span>
    )},
    { key: 'duration', label: 'Duration', sortable: true, render: (s: Study) => (
      <span className="text-accent font-medium text-xs">{s.remainingDays}/{s.totalDays}d</span>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader
        title={viewMode === 'active' ? 'Active Studies' : 'Historical Studies'}
        subtitle={`${filteredAndSortedData.length} studies`}
      >
        <Button
          variant="outline"
          className="gap-2 rounded-xl text-sm"
          onClick={() => { setViewMode(v => v === 'active' ? 'historical' : 'active'); setCurrentPage(1); setSearchQuery(''); setSelectedDoctors([]); setSortColumn(null); setSortDirection(null); }}
        >
          <FileText className="h-4 w-4" />
          {viewMode === 'active' ? 'Historical' : 'Active'}
        </Button>
      </DataPageHeader>

      <SearchToolbar value={searchQuery} onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }} placeholder="Search studies...">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 text-xs">
              <Filter className="h-3.5 w-3.5" />
              Physician {selectedDoctors.length > 0 && `(${selectedDoctors.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {allDoctors.map(doc => (
              <DropdownMenuCheckboxItem key={doc} checked={selectedDoctors.includes(doc)} onCheckedChange={() => { setSelectedDoctors(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]); setCurrentPage(1); }}>
                {doc}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchToolbar>

      <ModernTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/studies/${s.id}`)}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No studies found"
      />

      <ModernPagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        totalResults={filteredAndSortedData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Studies;
