"use client";

import { useState } from "react";
import { StoryReport, updateReportStatusAsAdmin } from "@/app/actions/admin/reports";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ReportDetailModalProps {
  report: StoryReport | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (reportId: string, status: 'pending' | 'reviewed' | 'dismissed', adminNotes?: string) => void;
}

export default function ReportDetailModal({ report, isOpen, onClose, onStatusUpdate }: ReportDetailModalProps) {
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'dismissed'>(report?.status || 'pending');
  const [adminNotes, setAdminNotes] = useState(report?.adminNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      onStatusUpdate(report.id, status, adminNotes);
      setMessage({ type: "success", text: "Report status updated successfully" });
      
      // Close modal after a short delay on success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      //console.error("Error updating report:", error);
      setMessage({ type: "error", text: "Failed to update report status" });
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black opacity-75"></div>
        </div>

        {/* Modal Content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full border border-gray-200 relative z-[110]">
          <div className="px-6 pt-5 pb-4 bg-white">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Report Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 block">Report ID</span>
                    <span className="font-mono text-sm">{report.id}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Reported On</span>
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Reporter</span>
                    <span>{report.reporterName || 'Anonymous'}</span>
                    <span className="block text-sm text-gray-500">{report.reporterEmail}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Story Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 block">Story Title</span>
                    <Link 
                      href={`/stories/${report.storyId}`} 
                      className="text-primary hover:text-primary/80 hover:underline"
                      target="_blank"
                    >
                      {report.story.title}
                    </Link>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Story ID</span>
                    <span className="font-mono text-sm">{report.storyId}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Author</span>
                    <span>{report.story.user.name || report.story.user.email}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Author Email</span>
                    <span className="text-sm">{report.story.user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Report Reason</h4>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="whitespace-pre-wrap">{report.reason}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Admin Response</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'reviewed' | 'dismissed')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="Add notes about this report..."
                ></textarea>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="primary"
                >
                  {submitting ? 'Updating...' : 'Update Report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
