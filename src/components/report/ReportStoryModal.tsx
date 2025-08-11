"use client";

import { useState } from "react";
import { createStoryReport } from "@/app/actions/admin/reports";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

interface ReportStoryModalProps {
  storyId: string;
  storyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportStoryModal({ storyId, storyTitle, isOpen, onClose }: ReportStoryModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions by disabling the submit button immediately
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
    
    if (!isAuthenticated || !user) {
      setMessage({ type: "error", text: "You must be logged in to report a story." });
      return;
    }
    
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Please provide a reason for reporting this story." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const result = await createStoryReport(
        storyId,
        user.email,
        user.name || null,
        reason
      );

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Report submitted successfully." });
        setReason("");
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to submit report." });
      }
    } catch (error) {
      //console.error("Error submitting report:", error);
      setMessage({ type: "error", text: "An error occurred while submitting your report." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
        
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" id="modal-title">Report Story</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You are reporting the story: <span className="font-medium text-gray-700 dark:text-gray-300">{storyTitle}</span>
            </p>
          </div>
          
          {message && (
            <div 
              className={`mb-4 p-3 rounded-md ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
              role="alert"
              aria-live="polite"
            >
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for reporting
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="Please explain why you're reporting this story..."
                disabled={submitting}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={submitting}
                className="flex items-center justify-center"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" role="status">
                      <title>Loading</title>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
