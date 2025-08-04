"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllReportsForAdmin, updateReportStatusAsAdmin, deleteReportAsAdmin, AdminReportFilters, StoryReport } from "@/app/actions/admin/reports";
import Link from "next/link";
import ReportDetailModal from "@/components/report/ReportDetailModal";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<StoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [selectedReport, setSelectedReport] = useState<StoryReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Search filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdminReportFilters>({
    reportId: '',
    storyId: '',
    reporterEmail: '',
    status: undefined,
    dateFrom: '',
    dateTo: ''
  });
  const [activeFilters, setActiveFilters] = useState<AdminReportFilters>({});

  // Redirect non-admin users
  useEffect(() => {
    if (isAuthenticated && !user?.isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated || !user?.isAdmin) return;

      setLoading(true);
      
      try {
        // NextAuth handles authentication on the server side now
        const result = await getAllReportsForAdmin(currentPage, 30, sortBy, activeFilters);
        setReports(result.reports);
        setTotalPages(Math.ceil(result.totalCount / 30));
      } catch (error) {
        //console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAuthenticated, user?.isAdmin, currentPage, sortBy, activeFilters]);

  // Handle status update
  const handleUpdateStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'dismissed', adminNotes?: string) => {
    try {
      // NextAuth handles authentication on the server side now
      const result = await updateReportStatusAsAdmin(reportId, status, adminNotes);
      
      if (result.success) {
        setActionMessage({ type: 'success', text: result.message || `Report status updated to ${status}` });
        
        // Update the report in the local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { ...report, status, adminNotes: adminNotes || report.adminNotes } 
              : report
          )
        );
      } else {
        setActionMessage({ type: 'error', text: result.message || "Failed to update report status" });
      }
    } catch (error) {
      //console.error("Error updating report status:", error);
      setActionMessage({ type: 'error', text: 'An error occurred while updating report status' });
    }
  };

  // Handle delete
  const handleDelete = async (reportId: string) => {
    try {
      // NextAuth handles authentication on the server side now
      const result = await deleteReportAsAdmin(reportId);
      
      if (result.success) {
        setActionMessage({ type: 'success', text: result.message || "Report deleted successfully" });
        setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      } else {
        setActionMessage({ type: 'error', text: result.message || "Failed to delete report" });
      }
    } catch (error) {
      //console.error("Error deleting report:", error);
      setActionMessage({ type: 'error', text: "An error occurred while deleting the report" });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  // Handle filter apply
  const applyFilters = () => {
    setActiveFilters({...filters});
    setCurrentPage(1);
  };

  // Handle filter reset
  const resetFilters = () => {
    setFilters({
      reportId: '',
      storyId: '',
      reporterEmail: '',
      status: undefined,
      dateFrom: '',
      dateTo: ''
    });
    setActiveFilters({});
    setCurrentPage(1);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const openReportModal = (report: StoryReport) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Reports</h1>
          <p className="text-foreground/70 mt-1">Manage all reports on the platform</p>
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
      
      {/* Action message */}
      {actionMessage && (
        <div className={`mb-4 p-4 rounded-md ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {actionMessage.text}
          <button 
            className="float-right text-sm" 
            onClick={() => setActionMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="mb-6">
        
        {showFilters && (
          <div className="bg-foreground/5 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Report ID</label>
                <input
                  type="text"
                  value={filters.reportId || ''}
                  onChange={(e) => setFilters({...filters, reportId: e.target.value})}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background"
                  placeholder="Enter report ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Story ID</label>
                <input
                  type="text"
                  value={filters.storyId || ''}
                  onChange={(e) => setFilters({...filters, storyId: e.target.value})}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background"
                  placeholder="Enter story ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reporter Email</label>
                <input
                  type="text"
                  value={filters.reporterEmail || ''}
                  onChange={(e) => setFilters({...filters, reporterEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background"
                  placeholder="Enter reporter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({...filters, status: e.target.value as any || undefined})}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-foreground/20 rounded-md hover:bg-foreground/5 text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Reports table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
            <div className="modern-card overflow-hidden shadow-sm rounded-lg border border-border/60">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">ID</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Story</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Reporter</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Date</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Status</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-foreground/5">
                        <td className="px-4 py-4 text-sm font-mono">{report.id.substring(0, 8)}...</td>
                        <td className="px-4 py-4">
                          <Link 
                            href={`/admin/story/view/${report.storyId}`}
                            className="text-primary hover:text-primary/80 hover:underline"
                            target="_blank"
                          >
                            {report.story.title.length > 30 ? report.story.title.substring(0, 30) + '...' : report.story.title}
                          </Link>
                          <div className="text-xs text-foreground/60 mt-1">
                            By: {report.story.user.name || report.story.user.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>{report.reporterName || 'Anonymous'}</div>
                          <div className="text-xs text-foreground/60">{report.reporterEmail}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">{formatDate(report.createdAt)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openReportModal(report)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="View Report Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmation(report.id);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Report"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                    {reports.length > 0 ? (
                      <>Page <span className="text-primary font-semibold">{currentPage}</span> of {totalPages}</>
                    ) : (
                      <>No results</>
                    )}
                  </span>
                  
                  {reports.length > 0 && (
                    <>
                      <span className="text-foreground/30">|</span>
                      <span>
                        Showing <span className="font-medium">{(currentPage - 1) * 30 + 1}-{(currentPage - 1) * 30 + reports.length}</span> of <span className="font-medium">{Math.min(30 * totalPages, reports.length + (currentPage - 1) * 30)}</span> reports
                      </span>
                    </>
                  )}
                </div>
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <nav className="flex items-center space-x-1">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      variant="ghost"
                      size="icon"
                      className={currentPage === 1 ? 'text-foreground/40 cursor-not-allowed' : ''}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    
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
                          <Button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            variant={currentPage === page ? "primary" : "ghost"}
                            className="w-10 h-10"
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()} 
                    
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="ghost"
                      size="icon"
                      className={currentPage === totalPages ? 'text-foreground/40 cursor-not-allowed' : ''}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </nav>
                )}
              </div>
            )}
          </>
        )}
      
      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 shadow-xl border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Report</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedReport(null);
        }}
        onStatusUpdate={handleUpdateStatus}
      />
    </div>
  );
}
