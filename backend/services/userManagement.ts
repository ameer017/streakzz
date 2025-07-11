import User from '../models/User';
import Project from '../models/Project';

export interface CleanupResult {
  deletedUsers: number;
  totalParticipants: number;
  participantsWithProjects: number;
  participantsWithZeroProjects: number;
  participantsWithTwoPlusProjects: number;
  message: string;
}

export class UserManagementService {
  /**
   * Automatically delete participant accounts that have zero projects
   * if there are participants with at least 2 projects
   * Stops cleanup when each remaining participant has 30+ project submissions
   */
  static async cleanupInactiveParticipants(): Promise<CleanupResult> {
    try {

      // Get all participants (not deleted)
      const allParticipants = await User.find({ 
        role: 'participant', 
        isDeleted: false 
      });

      if (allParticipants.length === 0) {
        return {
          deletedUsers: 0,
          totalParticipants: 0,
          participantsWithProjects: 0,
          participantsWithZeroProjects: 0,
          participantsWithTwoPlusProjects: 0,
          message: 'No participants found'
        };
      }

      // Get project counts for all participants
      const projectCounts = await Project.aggregate([
        {
          $group: {
            _id: '$userId',
            projectCount: { $sum: 1 }
          }
        }
      ]);

      // Create a map of userId to project count
      const projectCountMap = new Map();
      projectCounts.forEach(item => {
        projectCountMap.set(item._id.toString(), item.projectCount);
      });

      // Categorize participants
      const participantsWithZeroProjects: string[] = [];
      const participantsWithTwoPlusProjects: string[] = [];
      let participantsWithProjects = 0;

      allParticipants.forEach(participant => {
        const projectCount = projectCountMap.get(participant._id?.toString() || '') || 0;
        
        if (projectCount === 0) {
          participantsWithZeroProjects.push(participant._id?.toString() || '');
        } else {
          participantsWithProjects++;
          if (projectCount >= 2) {
            participantsWithTwoPlusProjects.push(participant._id?.toString() || '');
          }
        }
      });

      // Check if we should proceed with deletion
      if (participantsWithTwoPlusProjects.length === 0) {
        return {
          deletedUsers: 0,
          totalParticipants: allParticipants.length,
          participantsWithProjects,
          participantsWithZeroProjects: participantsWithZeroProjects.length,
          participantsWithTwoPlusProjects: participantsWithTwoPlusProjects.length,
          message: 'No participants with 2+ projects found. Skipping cleanup to preserve all accounts.'
        };
      }

      // Check if each remaining participant (after cleanup) would have 30+ projects
      const remainingParticipants = allParticipants.filter(participant => {
        const projectCount = projectCountMap.get(participant._id?.toString() || '') || 0;
        return projectCount > 0; // Only participants with projects would remain
      });

      // Check if all remaining participants have 30+ projects
      const allHaveThirtyPlus = remainingParticipants.every(participant => {
        const projectCount = projectCountMap.get(participant._id?.toString() || '') || 0;
        return projectCount >= 30;
      });

      // Also check if any participant has already reached the 30-project milestone
      const hasAnyThirtyPlusMilestone = allParticipants.some(participant => {
        return participant.hasReachedThirtyProjects;
      });

      if (allHaveThirtyPlus || hasAnyThirtyPlusMilestone) {
        return {
          deletedUsers: 0,
          totalParticipants: allParticipants.length,
          participantsWithProjects,
          participantsWithZeroProjects: participantsWithZeroProjects.length,
          participantsWithTwoPlusProjects: participantsWithTwoPlusProjects.length,
          message: `Cleanup skipped: ${allHaveThirtyPlus ? 'All remaining participants have 30+ project submissions' : 'Some participants have reached the 30-project milestone'}.`
        };
      }

      // Delete participants with zero projects
      let deletedUsers = 0;
      if (participantsWithZeroProjects.length > 0) {
        const result = await User.updateMany(
          { 
            _id: { $in: participantsWithZeroProjects },
            role: 'participant',
            isDeleted: false
          },
          { isDeleted: true }
        );
        deletedUsers = result.modifiedCount;
      }

      const totalProjects = await Project.countDocuments();

      return {
        deletedUsers,
        totalParticipants: allParticipants.length,
        participantsWithProjects,
        participantsWithZeroProjects: participantsWithZeroProjects.length,
        participantsWithTwoPlusProjects: participantsWithTwoPlusProjects.length,
        message: `Successfully deleted ${deletedUsers} inactive participant accounts. ${participantsWithTwoPlusProjects.length} participants have 2+ projects. Total projects: ${totalProjects}.`
      };

    } catch (error) {
      throw new Error(`Failed to cleanup inactive participants: ${error}`);
    }
  }

  /**
   * Get statistics about participant accounts and their project counts
   */
  static async getParticipantStats() {
    try {
      const allParticipants = await User.find({ 
        role: 'participant', 
        isDeleted: false 
      });

      const projectCounts = await Project.aggregate([
        {
          $group: {
            _id: '$userId',
            projectCount: { $sum: 1 }
          }
        }
      ]);

      const projectCountMap = new Map();
      projectCounts.forEach(item => {
        projectCountMap.set(item._id.toString(), item.projectCount);
      });

      const stats = {
        totalParticipants: allParticipants.length,
        participantsWithZeroProjects: 0,
        participantsWithOneProject: 0,
        participantsWithTwoPlusProjects: 0,
        participantsWithProjects: 0
      };

      allParticipants.forEach(participant => {
        const projectCount = projectCountMap.get(participant._id?.toString() || '') || 0;
        
        if (projectCount === 0) {
          stats.participantsWithZeroProjects++;
        } else {
          stats.participantsWithProjects++;
          if (projectCount === 1) {
            stats.participantsWithOneProject++;
          } else if (projectCount >= 2) {
            stats.participantsWithTwoPlusProjects++;
          }
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get participant stats: ${error}`);
    }
  }
} 