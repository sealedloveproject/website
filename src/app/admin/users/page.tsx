'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllUsers, deleteUsers, toggleUserAdminStatus, type User } from '@/app/actions/admin/users';
import { Button } from '@/components/ui/Button';

export default function UsersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    email: '',
    name: '',
    isAdmin: '',
    dateFrom: '',
    dateTo: ''
  });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user?.isAdmin, router]);

  // Load users data
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.isAdmin) return;
    
    loadUsers();
  }, [authLoading, isAuthenticated, user?.isAdmin]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getAllUsers();
      
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (error) {
      //console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`)) {
      setIsLoading(true);
      const result = await deleteUsers(Array.from(selectedUsers));
      setIsLoading(false);
      
      if (result?.success) {
        // Clear selection and refresh users list
        setSelectedUsers(new Set());
        loadUsers();
      } else {
        alert(`Error: ${result?.error || 'Failed to delete users'}`);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      setIsLoading(true);
      const result = await deleteUsers([userId]);
      setIsLoading(false);
      
      if (result?.success) {
        // Refresh users list
        loadUsers();
      } else {
        alert(`Error: ${result?.error || 'Failed to delete user'}`);
      }
    }
  };

  const toggleAdminStatus = async (userId: string) => {
    try {
      const result = await toggleUserAdminStatus(userId);
      
      if (result.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isAdmin: result.isAdmin || !u.isAdmin } : u
        ));
      } else {
        setError(result.error || 'Failed to update admin status');
      }
    } catch (error) {
      //console.error('Error toggling admin status:', error);
      setError('Failed to update admin status. Please try again.');
    }
  };

  // Apply filters to users
  const filteredUsers = users.filter(user => {
    // Apply search term if present
    if (searchTerm && !(
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )) {
      return false;
    }
    
    // Apply email filter
    if (activeFilters.email && !user.email.toLowerCase().includes(activeFilters.email.toLowerCase())) {
      return false;
    }
    
    // Apply name filter
    if (activeFilters.name) {
      if (!user.name || !user.name.toLowerCase().includes(activeFilters.name.toLowerCase())) {
        return false;
      }
    }
    
    // Apply admin filter
    if (activeFilters.isAdmin) {
      const isAdmin = user.isAdmin ? 'yes' : 'no';
      if (isAdmin !== activeFilters.isAdmin.toLowerCase()) {
        return false;
      }
    }
    
    // Apply date range filters
    if (activeFilters.dateFrom) {
      const fromDate = new Date(activeFilters.dateFrom);
      const userDate = new Date(user.createdAt);
      if (userDate < fromDate) {
        return false;
      }
    }
    
    if (activeFilters.dateTo) {
      const toDate = new Date(activeFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      const userDate = new Date(user.createdAt);
      if (userDate > toDate) {
        return false;
      }
    }
    
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 mt-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
            <p className="text-foreground/70 mt-1">View and manage all users on the platform</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-foreground/5 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mb-8 p-4 bg-foreground/5 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Search Filters</h2>
              {Object.keys(activeFilters).length > 0 && (
                <button 
                  onClick={() => {
                    setFilters({
                      email: '',
                      name: '',
                      isAdmin: '',
                      dateFrom: '',
                      dateTo: ''
                    });
                    setActiveFilters({});
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Quick Search</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              </div>
              
              {/* Email filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => setFilters({...filters, email: e.target.value})}
                  placeholder="Filter by email"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>
              
              {/* Name filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                  placeholder="Filter by first or last name"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>
              
              {/* Admin status filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Admin Status</label>
                <select
                  value={filters.isAdmin}
                  onChange={(e) => setFilters({...filters, isAdmin: e.target.value})}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="">All users</option>
                  <option value="yes">Admins only</option>
                  <option value="no">Non-admins only</option>
                </select>
              </div>
              
              {/* Date range filters */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Created From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Created To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveFilters({...filters})}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="modern-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Name</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Email</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Stories</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Created</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Last Login</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Role</th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-foreground/5">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">
                        {user.name || 'No name'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {user.storiesCount || 0}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => toggleAdminStatus(user.id)}
                          variant="ghost"
                          size="icon"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        >
                          {user.isAdmin ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="ghost"
                          size="icon"
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Delete User"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">No users found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No users are registered yet.'}
              </p>
            </div>
          )}
        </div>

      {/* No statistics section as requested */}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Users</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}? 
                This action cannot be undone and will permanently delete their accounts, stories, and all associated data.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUsers}
                variant="destructive"
                className="flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Users'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
