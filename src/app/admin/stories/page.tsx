"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllStoriesForAdmin, updateStoryAsAdmin, deleteStoryAsAdmin, AdminStoryFilters } from "@/app/actions/admin/stories";
import Link from "next/link";

export default function StoriesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Search filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdminStoryFilters>({
    storyId: '',
    authorEmail: '',
    authorId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [activeFilters, setActiveFilters] = useState<AdminStoryFilters>({});

  // Redirect non-admin users
  useEffect(() => {
    if (isAuthenticated && !user?.isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      if (!isAuthenticated || !user?.isAdmin) return;

      setLoading(true);
      
      try {
        // NextAuth handles authentication on the server side now
        const result = await getAllStoriesForAdmin(currentPage, 30, sortBy, activeFilters);
        setStories(result.stories);
        setTotalPages(Math.ceil(result.totalCount / 30));
      } catch (error) {
        //console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [isAuthenticated, user?.isAdmin, currentPage, sortBy, activeFilters]);
  
  // Handle filter application
  const applyFilters = () => {
    // Only include non-empty filters
    const newActiveFilters: AdminStoryFilters = {};
    
    if (filters.storyId) newActiveFilters.storyId = filters.storyId;
    if (filters.authorEmail) newActiveFilters.authorEmail = filters.authorEmail;
    if (filters.authorId) newActiveFilters.authorId = filters.authorId;
    if (filters.dateFrom) newActiveFilters.dateFrom = filters.dateFrom;
    if (filters.dateTo) newActiveFilters.dateTo = filters.dateTo;
    
    setActiveFilters(newActiveFilters);
    setCurrentPage(1); // Reset to first page when applying filters
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      storyId: '',
      authorEmail: '',
      authorId: '',
      dateFrom: '',
      dateTo: ''
    });
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleTogglePublic = async (storyId: string, currentStatus: boolean) => {
    try {
      // NextAuth handles authentication on the server side now
      const result = await updateStoryAsAdmin(storyId, {
        isPublic: !currentStatus
      });

      if (result.success) {
        // Update local state
        setStories(stories.map(story => 
          story.id === storyId ? { ...story, isPublic: !currentStatus } : story
        ));
        setActionMessage({
          type: 'success',
          text: `Story visibility changed to ${!currentStatus ? 'public' : 'private'} successfully`
        });
      } else {
        setActionMessage({
          type: 'error',
          text: result.message || 'Failed to update story visibility'
        });
      }
    } catch (error) {
      //console.error("Error updating story:", error);
      setActionMessage({
        type: 'error',
        text: 'An error occurred while updating the story'
      });
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      // NextAuth handles authentication on the server side now
      const result = await deleteStoryAsAdmin(storyId);

      if (result.success) {
        // Remove from local state
        setStories(stories.filter(story => story.id !== storyId));
        setDeleteConfirmation(null);
        setActionMessage({
          type: 'success',
          text: 'Story deleted successfully'
        });
      } else {
        setActionMessage({
          type: 'error',
          text: result.message || 'Failed to delete story'
        });
      }
    } catch (error) {
      //console.error("Error deleting story:", error);
      setActionMessage({
        type: 'error',
        text: 'An error occurred while deleting the story'
      });
    }
  };

  // If not authenticated or not admin, show loading
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Stories</h1>
          <p className="text-foreground/70 mt-1">Manage all stories on the platform</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-foreground/5 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {Object.keys(activeFilters).length > 0 ? `Filters (${Object.keys(activeFilters).length})` : 'Filters'}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="newest">Sort by Newest</option>
            <option value="popular">Sort by Most Loved</option>
          </select>
        </div>
      </div>
      
      {/* Search Filters */}
      {showFilters && (
        <div className="mb-8 p-4 bg-foreground/5 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Search Filters</h2>
            {Object.keys(activeFilters).length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/80"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Story ID</label>
              <input
                type="text"
                value={filters.storyId || ''}
                onChange={(e) => setFilters({...filters, storyId: e.target.value})}
                placeholder="Enter story ID"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Author Email</label>
              <input
                type="text"
                value={filters.authorEmail || ''}
                onChange={(e) => setFilters({...filters, authorEmail: e.target.value})}
                placeholder="Enter author email"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Author ID</label>
              <input
                type="text"
                value={filters.authorId || ''}
                onChange={(e) => setFilters({...filters, authorId: e.target.value})}
                placeholder="Enter author ID"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Active filters summary */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeFilters.storyId && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Story ID: {activeFilters.storyId}
              <button 
                onClick={() => {
                  const newFilters = {...activeFilters};
                  delete newFilters.storyId;
                  setActiveFilters(newFilters);
                  setFilters({...filters, storyId: ''});
                }}
                className="ml-2 text-primary hover:text-primary/80"
              >
                &times;
              </button>
            </div>
          )}
          
          {activeFilters.authorEmail && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Email: {activeFilters.authorEmail}
              <button 
                onClick={() => {
                  const newFilters = {...activeFilters};
                  delete newFilters.authorEmail;
                  setActiveFilters(newFilters);
                  setFilters({...filters, authorEmail: ''});
                }}
                className="ml-2 text-primary hover:text-primary/80"
              >
                &times;
              </button>
            </div>
          )}
          
          {activeFilters.authorId && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Author ID: {activeFilters.authorId}
              <button 
                onClick={() => {
                  const newFilters = {...activeFilters};
                  delete newFilters.authorId;
                  setActiveFilters(newFilters);
                  setFilters({...filters, authorId: ''});
                }}
                className="ml-2 text-primary hover:text-primary/80"
              >
                &times;
              </button>
            </div>
          )}
          
          {(activeFilters.dateFrom || activeFilters.dateTo) && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Date: {activeFilters.dateFrom ? new Date(activeFilters.dateFrom).toLocaleDateString() : 'Any'} to {activeFilters.dateTo ? new Date(activeFilters.dateTo).toLocaleDateString() : 'Any'}
              <button 
                onClick={() => {
                  const newFilters = {...activeFilters};
                  delete newFilters.dateFrom;
                  delete newFilters.dateTo;
                  setActiveFilters(newFilters);
                  setFilters({...filters, dateFrom: '', dateTo: ''});
                }}
                className="ml-2 text-primary hover:text-primary/80"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      )}

      {actionMessage && (
        <div className={`mb-6 p-4 rounded-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
          <button 
            className="float-right font-bold"
            onClick={() => setActionMessage(null)}
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="modern-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Title</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Author</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Date</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Likes</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Status</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stories.map((story) => (
                    <tr key={story.id} className="hover:bg-foreground/5">
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">{story.title}</div>
                        <div className="text-xs text-foreground/60 mt-1 line-clamp-1 italic">{story.excerpt}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-foreground">{story.author}</div>
                        <div className="text-xs text-foreground/60">{story.authorEmail}</div>
                      </td>
                      <td className="px-4 py-4 text-sm">{story.date}</td>
                      <td className="px-4 py-4 text-sm">{story.likes}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          story.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {story.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/admin/story/view/${story.id}`}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-full"
                            title="View Story"
                          >
                            <span className="sr-only">View</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleTogglePublic(story.id, story.isPublic)}
                            className={`p-1.5 rounded-full ${
                              story.isPublic ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={story.isPublic ? 'Unpublish' : 'Publish'}
                          >
                            <span className="sr-only">{story.isPublic ? 'Unpublish' : 'Publish'}</span>
                            {story.isPublic ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation(story.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                            title="Delete Story"
                          >
                            <span className="sr-only">Delete</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination info and controls */}
          {totalPages > 0 && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              {/* Page info */}
              <div className="flex items-center gap-3 bg-foreground/5 px-4 py-2 rounded-md text-sm">
                <span className="font-medium text-foreground">
                  {stories.length > 0 ? (
                    <>Page <span className="text-primary font-semibold">{currentPage}</span> of {totalPages}</>
                  ) : (
                    <>No results</>
                  )}
                </span>
                
                {stories.length > 0 && (
                  <>
                    <span className="text-foreground/30">|</span>
                    <span>
                      Showing <span className="font-medium">{(currentPage - 1) * 30 + 1}-{(currentPage - 1) * 30 + stories.length}</span> of <span className="font-medium">{Math.min(30 * totalPages, stories.length + (currentPage - 1) * 30)}</span> stories
                    </span>
                  </>
                )}
              </div>
              
              {/* Pagination controls */}
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 1
                      ? 'text-foreground/40 cursor-not-allowed'
                      : 'text-foreground hover:bg-foreground/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Page numbers with intelligent display for large number of pages */}
                {(() => {
                  // Create an array of page numbers to display
                  const pageNumbers = [];
                  
                  // Always show first page
                  if (totalPages > 0) pageNumbers.push(1);
                  
                  // Add ellipsis after first page if needed
                  if (currentPage > 4) pageNumbers.push('ellipsis-1');
                  
                  // Add pages around current page
                  for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                    pageNumbers.push(i);
                  }
                  
                  // Add ellipsis before last page if needed
                  if (currentPage < totalPages - 3) pageNumbers.push('ellipsis-2');
                  
                  // Always show last page if there is more than one page
                  if (totalPages > 1) pageNumbers.push(totalPages);
                  
                  // Render the page numbers
                  return pageNumbers.map((page) => {
                    if (page === 'ellipsis-1' || page === 'ellipsis-2') {
                      return (
                        <span key={page} className="px-3 py-2 text-foreground/60">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-foreground/10'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()} 
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'text-foreground/40 cursor-not-allowed'
                      : 'text-foreground hover:bg-foreground/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 shadow-xl border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              Are you sure you want to delete this story? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStory(deleteConfirmation)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
