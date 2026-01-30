import React, { useState, useMemo } from 'react';
import { Search, Filter, FileText, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
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

// Mock data for active studies
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

// Mock data for historical studies
const historicalStudiesData: Study[] = [
  { id: '1', patient: 'TestJulyTwentySix TestJulyTwentySix', studyType: 'New Type', orderStatus: 'Monitoring Complete', doctor: 'Michael Kaminski', startDate: '08/02/2024', endDate: '08/03/2024', remainingDays: 0, totalDays: 10 },
];

// Get unique doctors for filter
const allDoctors = [...new Set([...activeStudiesData, ...historicalStudiesData].map(s => s.doctor))];

const Studies: React.FC = () => {
  const [viewMode, setViewMode] = useState<'active' | 'historical'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const currentData = viewMode === 'active' ? activeStudiesData : historicalStudiesData;

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...currentData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(study =>
        study.patient.toLowerCase().includes(query) ||
        study.studyType.toLowerCase().includes(query) ||
        study.doctor.toLowerCase().includes(query) ||
        study.orderStatus.toLowerCase().includes(query)
      );
    }

    // Apply doctor filter
    if (selectedDoctors.length > 0) {
      result = result.filter(study => selectedDoctors.includes(study.doctor));
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortColumn) {
          case 'patient':
            aValue = a.patient;
            bValue = b.patient;
            break;
          case 'studyType':
            aValue = a.studyType;
            bValue = b.studyType;
            break;
          case 'orderStatus':
            aValue = a.orderStatus;
            bValue = b.orderStatus;
            break;
          case 'doctor':
            aValue = a.doctor;
            bValue = b.doctor;
            break;
          case 'startDate':
          case 'endDate':
            aValue = new Date(a[sortColumn]).getTime();
            bValue = new Date(b[sortColumn]).getTime();
            break;
          case 'duration':
            aValue = a.totalDays;
            bValue = b.totalDays;
            break;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return result;
  }, [currentData, searchQuery, selectedDoctors, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleDoctorFilter = (doctor: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctor)
        ? prev.filter(d => d !== doctor)
        : [...prev, doctor]
    );
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: SortColumn }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp
        className={cn(
          "h-3 w-3 -mb-1",
          sortColumn === column && sortDirection === 'asc'
            ? "text-accent"
            : "text-muted-foreground/40"
        )}
      />
      <ChevronDown
        className={cn(
          "h-3 w-3",
          sortColumn === column && sortDirection === 'desc'
            ? "text-accent"
            : "text-muted-foreground/40"
        )}
      />
    </span>
  );

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {viewMode === 'active' ? 'Active Studies' : 'Historical Studies'}
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            setViewMode(viewMode === 'active' ? 'historical' : 'active');
            setCurrentPage(1);
            setSearchQuery('');
            setSelectedDoctors([]);
            setSortColumn(null);
            setSortDirection(null);
          }}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {viewMode === 'active' ? 'View Historical Studies' : 'View Active Studies'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter Physician ({selectedDoctors.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {allDoctors.map(doctor => (
              <DropdownMenuCheckboxItem
                key={doctor}
                checked={selectedDoctors.includes(doctor)}
                onCheckedChange={() => toggleDoctorFilter(doctor)}
              >
                {doctor}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('patient')}
              >
                <div className="flex items-center">
                  Patient
                  <SortIcon column="patient" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('studyType')}
              >
                <div className="flex items-center">
                  Study Type
                  <SortIcon column="studyType" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('orderStatus')}
              >
                <div className="flex items-center">
                  Order Status
                  <SortIcon column="orderStatus" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('doctor')}
              >
                <div className="flex items-center">
                  Doctor
                  <SortIcon column="doctor" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center">
                  Start Date
                  <SortIcon column="startDate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('endDate')}
              >
                <div className="flex items-center">
                  End Date
                  <SortIcon column="endDate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-muted-foreground uppercase text-xs tracking-wide"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center">
                  Remaining/Total Duration
                  <SortIcon column="duration" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No studies found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((study) => (
                <TableRow key={study.id} className="table-row-hover cursor-pointer">
                  <TableCell className="font-medium text-accent hover:underline">
                    {study.patient}
                  </TableCell>
                  <TableCell className="text-foreground">{study.studyType}</TableCell>
                  <TableCell className="text-foreground">{study.orderStatus}</TableCell>
                  <TableCell className="text-foreground">{study.doctor}</TableCell>
                  <TableCell className="text-foreground">{study.startDate}</TableCell>
                  <TableCell className="text-foreground">{study.endDate}</TableCell>
                  <TableCell className="text-accent">
                    {study.remainingDays} / {study.totalDays} Days
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
          {filteredAndSortedData.length} results
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {renderPagination().map((page, idx) => (
            typeof page === 'number' ? (
              <Button
                key={idx}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  "h-8 w-8",
                  currentPage === page && "bg-primary text-primary-foreground"
                )}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={idx} className="px-2 text-muted-foreground">
                {page}
              </span>
            )
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Studies;
