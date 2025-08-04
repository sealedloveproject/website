"use server";

import { prisma } from '@/lib/prisma';
import { ServerActionResponse } from '@/types';
import { isAdmin, getAuthenticatedUser } from '@/lib/auth-server';

export type StoryReport = {
  id: string;
  storyId: string;
  reporterEmail: string;
  reporterName?: string | null;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  story: {
    id: string;
    title: string;
    userId: string;
    user: {
      email: string;
      name?: string | null;
    };
  };
};

export type AdminReportsResult = {
  reports: StoryReport[];
  totalCount: number;
  hasMore: boolean;
};

export type AdminReportFilters = {
  reportId?: string;
  storyId?: string;
  reporterEmail?: string;
  status?: 'pending' | 'reviewed' | 'dismissed';
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Gets all story reports for admin management with pagination
 * Only accessible to admin users
 */
export async function getAllReportsForAdmin(
  page: number = 1,
  pageSize: number = 30,
  sortBy: 'newest' | 'oldest' = 'newest',
  filters?: AdminReportFilters
): Promise<AdminReportsResult> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        reports: [],
        totalCount: 0,
        hasMore: false
      };
    }

    // Build where clause based on filters
    const whereClause: any = {};
    
    if (filters) {
      if (filters.reportId) {
        whereClause.id = filters.reportId;
      }
      
      if (filters.storyId) {
        whereClause.storyId = filters.storyId;
      }
      
      if (filters.reporterEmail) {
        whereClause.reporterEmail = {
          contains: filters.reporterEmail,
          mode: 'insensitive'
        };
      }
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      // Date range filters
      if (filters.dateFrom || filters.dateTo) {
        whereClause.createdAt = {};
        
        if (filters.dateFrom) {
          whereClause.createdAt.gte = new Date(filters.dateFrom);
        }
        
        if (filters.dateTo) {
          // Add one day to include the end date fully
          const endDate = new Date(filters.dateTo);
          endDate.setDate(endDate.getDate() + 1);
          whereClause.createdAt.lt = endDate;
        }
      }
    }
    
    // Calculate pagination parameters
    const skip = (page - 1) * pageSize;
    
    // Get total count for pagination info with filters
    const totalCount = await prisma.storyReport.count({
      where: whereClause
    });
    
    // Get paginated reports
    const reports = await prisma.storyReport.findMany({
      where: whereClause,
      orderBy: sortBy === 'newest'
        ? { createdAt: 'desc' }
        : { createdAt: 'asc' },
      skip,
      take: pageSize,
      include: {
        story: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Calculate if there are more pages
    const hasMore = totalCount > skip + reports.length;
    
    return {
      reports: reports as StoryReport[],
      totalCount,
      hasMore
    };
  } catch (error) {
    //console.error('Error fetching reports for admin:', error);
    return {
      reports: [],
      totalCount: 0,
      hasMore: false
    };
  }
}

/**
 * Updates a report status as an admin
 * Only accessible to admin users
 */
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'dismissed',
  adminNotes?: string
): Promise<ServerActionResponse> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        success: false,
        message: "Unauthorized: Admin access required"
      };
    }

    // Update the report
    await prisma.storyReport.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: "Report status updated successfully"
    };
  } catch (error) {
    //console.error('Error updating report status:', error);
    return {
      success: false,
      message: "Failed to update report status"
    };
  }
}

/**
 * Deletes a report as an admin
 * Only accessible to admin users
 */
export async function deleteReport(
  reportId: string
): Promise<ServerActionResponse> {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return {
        success: false,
        message: "Unauthorized: Admin access required"
      };
    }

    // Delete the report
    await prisma.storyReport.delete({
      where: { id: reportId }
    });

    return {
      success: true,
      message: "Report deleted successfully"
    };
  } catch (error) {
    //console.error('Error deleting report:', error);
    return {
      success: false,
      message: "Failed to delete report"
    };
  }
}

/**
 * Creates a new story report from a user
 * This function is accessible to any authenticated user
 */
export async function createStoryReport(
  storyId: string,
  reporterEmail: string,
  reporterName: string | null,
  reason: string
): Promise<ServerActionResponse> {
  try {
    // Verify authentication using NextAuth
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.email !== reporterEmail) {
      return {
        success: false,
        message: "Unauthorized: Authentication required"
      };
    }
    
    // Validate inputs
    if (!storyId || !reporterEmail || !reason) {
      return {
        success: false,
        message: "Missing required information"
      };
    }

    // Check if the story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return {
        success: false,
        message: "Story not found"
      };
    }

    // Create the report
    await prisma.storyReport.create({
      data: {
        id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        storyId,
        reporterEmail,
        reporterName,
        reason,
        status: 'pending',
        adminNotes: null,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: "Report submitted successfully"
    };
  } catch (error) {
    //console.error('Error creating story report:', error);
    return {
      success: false,
      message: "Failed to submit report"
    };
  }
}

/**
 * Alias for updateReportStatus to maintain compatibility with existing code
 * Only accessible to admin users
 */
export async function updateReportStatusAsAdmin(
  reportId: string,
  status: 'pending' | 'reviewed' | 'dismissed',
  adminNotes?: string
): Promise<ServerActionResponse> {
  return updateReportStatus(reportId, status, adminNotes);
}

/**
 * Alias for deleteReport to maintain compatibility with existing code
 * Only accessible to admin users
 */
export async function deleteReportAsAdmin(
  reportId: string
): Promise<ServerActionResponse> {
  return deleteReport(reportId);
}
