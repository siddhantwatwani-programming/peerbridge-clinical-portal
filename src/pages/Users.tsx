import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';

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

  const columns = [
    { key: 'firstName', label: 'First Name', sortable: true, render: (u: User) => (
      <span className="font-medium text-foreground">{u.firstName}</span>
    )},
    { key: 'lastName', label: 'Last Name', sortable: true, render: (u: User) => (
      <span className="font-medium text-foreground">{u.lastName}</span>
    )},
    { key: 'createdDate', label: 'Created', sortable: true, render: (u: User) => (
      <span className="text-muted-foreground text-xs tabular-nums">{u.createdDate}</span>
    )},
    { key: 'updateDate', label: 'Last Updated', sortable: true, render: (u: User) => (
      <span className="text-muted-foreground text-xs tabular-nums">{u.updateDate}</span>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader title="Site Settings" subtitle={`${totalResults} users registered`}>
        <Button variant="accent" className="gap-2 rounded-xl shadow-lg shadow-accent/10" onClick={() => navigate('/users/add')}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </DataPageHeader>

      <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search users..." />

      <ModernTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found"
      />

      <ModernPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Users;
