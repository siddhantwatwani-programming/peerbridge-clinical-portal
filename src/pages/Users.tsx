import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  createdDate: string;
  updateDate: string;
}

const users: User[] = [
  { id: '1', firstName: 'SSRF', lastName: 'Burpsuite', createdDate: '07/31/2025 -01:29:27 PM', updateDate: '07/31/2025 -01:29:27 PM' },
  { id: '2', firstName: 'test111', lastName: 'admin', createdDate: '08/20/2025 -12:19:43 AM', updateDate: '01/15/2026 -04:35:21 AM' },
  { id: '3', firstName: 'vikas', lastName: 'kumar', createdDate: '09/24/2025 -02:30:16 AM', updateDate: '09/24/2025 -02:30:16 AM' },
  { id: '4', firstName: 'Vikas', lastName: 'Kumar', createdDate: '08/26/2025 -02:02:02 AM', updateDate: '08/26/2025 -02:02:02 AM' },
  { id: '5', firstName: 'New', lastName: 'User', createdDate: '08/14/2025 -05:44:10 AM', updateDate: '08/19/2025 -10:46:00 PM' },
  { id: '6', firstName: 'Ravi', lastName: 'clinician', createdDate: '08/26/2025 -05:34:09 AM', updateDate: '08/26/2025 -05:34:09 AM' },
  { id: '7', firstName: 'vikas', lastName: 'kumar', createdDate: '09/24/2025 -01:57:17 AM', updateDate: '09/24/2025 -01:57:17 AM' },
  { id: '8', firstName: 'test', lastName: 'test', createdDate: '08/14/2025 -05:49:13 AM', updateDate: '08/14/2025 -05:49:13 AM' },
  { id: '9', firstName: 'rahul', lastName: 'admin', createdDate: '08/20/2025 -01:04:27 AM', updateDate: '08/20/2025 -01:04:27 AM' },
  { id: '10', firstName: 'sarthak', lastName: 'vohra', createdDate: '08/14/2025 -03:57:04 AM', updateDate: '08/14/2025 -03:57:04 AM' },
];

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalResults = 140;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Site Settings</h1>
        <Button variant="accent" className="gap-2" onClick={() => navigate('/users/add')}>
          <Plus className="h-4 w-4" />
          Add a New User
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
                    CREATED DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    UPDATE DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm text-foreground">
                    {user.firstName}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {user.lastName}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.createdDate}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.updateDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing 1 to {itemsPerPage} of {totalResults} results</span>
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
          {[1, 2, 3, 4].map((page) => (
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

export default Users;
