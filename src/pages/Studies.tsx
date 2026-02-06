import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'patient' | 'studyType' | 'orderStatus' | 'doctor' | 'startDate' | 'endDate' | 'duration' | null;

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

const Studies: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'active' | 'historical'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleRowClick = (studyId: string) => navigate(`/studies/${studyId}`);
  const currentData = viewMode === 'active' ? activeStudiesData : historicalStudiesData;

  const filteredAndSortedData = useMemo(() => {
    let result = [...currentData];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(study =>
        study.patient.toLowerCase().includes(query) ||
        study.studyType.toLowerCase().includes(query) ||
        study.doctor.toLowerCase().includes(query) ||
        study.orderStatus.toLowerCase().includes(query)
      );
    }
    if (selectedDoctors.length > 0) {
      result = result.filter(study => selectedDoctors.includes(study.doctor));
    }
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';
        switch (sortColumn) {
          case 'patient': aValue = a.patient; bValue = b.patient; break;
          case 'studyType': aValue = a.studyType; bValue = b.studyType; break;
          case 'orderStatus': aValue = a.orderStatus; bValue = b.orderStatus; break;
          case 'doctor': aValue = a.doctor; bValue = b.doctor; break;
          case 'startDate': case 'endDate':
            aValue = new Date(a[sortColumn]).getTime(); bValue = new Date(b[sortColumn]).getTime(); break;
          case 'duration': aValue = a.totalDays; bValue = b.totalDays; break;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      });
    }
    return result;
  }, [currentData, searchQuery, selectedDoctors, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else { setSortColumn(null); setSortDirection(null); }
    } else { setSortColumn(column); setSortDirection('asc'); }
  };

  const toggleDoctorFilter = (doctor: string) => {
    setSelectedDoctors(prev => prev.includes(doctor) ? prev.filter(d => d !== doctor) : [...prev, doctor]);
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: SortColumn }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp className={cn("h-3 w-3 -mb-1", sortColumn === column && sortDirection === 'asc' ? "text-accent" : "text-muted-foreground/40")} />
      <ChevronDown className={cn("h-3 w-3", sortColumn === column && sortDirection === 'desc' ? "text-accent" : "text-muted-foreground/40")} />
    </span>
  );

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Studies</h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredAndSortedData.length} studies found</p>
        </div>
        <div className="inline-flex items-center border-b border-border">
          {[
            { value: 'active', label: 'Active Studies' },
            { value: 'historical', label: 'Historical Studies' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => {
                setViewMode(tab.value as 'active' | 'historical');
                setCurrentPage(1); setSearchQuery(''); setSelectedDoctors([]); setSortColumn(null); setSortDirection(null);
              }}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:transition-all after:duration-200 ${
                viewMode === tab.value ? 'text-accent after:bg-accent' : 'text-muted-foreground hover:text-foreground after:bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl border-border">
              <Filter className="h-4 w-4" />
              Filter Physician ({selectedDoctors.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {allDoctors.map(doctor => (
              <DropdownMenuCheckboxItem key={doctor} checked={selectedDoctors.includes(doctor)} onCheckedChange={() => toggleDoctorFilter(doctor)}>
                {doctor}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search studies..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 rounded-xl" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {[
                { col: 'patient' as SortColumn, label: 'Patient' },
                { col: 'studyType' as SortColumn, label: 'Study Type' },
                { col: 'orderStatus' as SortColumn, label: 'Order Status' },
                { col: 'doctor' as SortColumn, label: 'Doctor' },
                { col: 'startDate' as SortColumn, label: 'Start Date' },
                { col: 'endDate' as SortColumn, label: 'End Date' },
                { col: 'duration' as SortColumn, label: 'Duration' },
              ].map(h => (
                <TableHead key={h.label} className="cursor-pointer select-none text-xs font-semibold text-muted-foreground uppercase tracking-wider" onClick={() => handleSort(h.col)}>
                  <div className="flex items-center">{h.label}<SortIcon column={h.col} /></div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No studies found</TableCell></TableRow>
            ) : (
              paginatedData.map((study) => (
                <TableRow key={study.id} className="cursor-pointer hover:bg-accent/[0.03] transition-colors" onClick={() => handleRowClick(study.id)}>
                  <TableCell className="font-medium text-accent">{study.patient}</TableCell>
                  <TableCell className="text-foreground">{study.studyType}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      study.orderStatus === 'In Progress' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                    )}>{study.orderStatus}</span>
                  </TableCell>
                  <TableCell className="text-foreground">{study.doctor}</TableCell>
                  <TableCell className="text-muted-foreground">{study.startDate}</TableCell>
                  <TableCell className="text-muted-foreground">{study.endDate}</TableCell>
                  <TableCell className="text-accent font-medium">{study.remainingDays} / {study.totalDays} Days</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {renderPagination().map((page, idx) => (
            typeof page === 'number' ? (
              <Button key={idx} variant={currentPage === page ? 'default' : 'outline'} size="icon" className={cn("h-8 w-8 rounded-lg", currentPage === page && "bg-accent text-accent-foreground hover:bg-accent/90")} onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ) : (<span key={idx} className="px-2 text-muted-foreground">{page}</span>)
          ))}
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Studies;
