import cron from 'node-cron';
import { UserManagementService } from './userManagement';

export class SchedulerService {
  private static cleanupJob: cron.ScheduledTask | null = null;

  /**
   * Start the automatic cleanup scheduler
   * Runs cleanup every day at 11:59 PM by default
   */
  static startCleanupScheduler(schedule: string = '59 23 * * *'): void {
    if (this.cleanupJob) {
      console.log('Cleanup scheduler is already running');
      return;
    }

    this.cleanupJob = cron.schedule(schedule, async () => {
      try {
        console.log('Running automatic cleanup of inactive participants...');
        const result = await UserManagementService.cleanupInactiveParticipants();
        console.log('Cleanup completed:', result.message);
      } catch (error) {
        console.error('Error during automatic cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log(`Cleanup scheduler started with schedule: ${schedule}`);
  }

  /**
   * Stop the automatic cleanup scheduler
   */
  static stopCleanupScheduler(): void {
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      this.cleanupJob = null;
      console.log('Cleanup scheduler stopped');
    }
  }

  /**
   * Get the current status of the scheduler
   */
  static getSchedulerStatus(): { isRunning: boolean; schedule?: string } {
    return {
      isRunning: this.cleanupJob !== null,
      schedule: this.cleanupJob ? '59 23 * * *' : undefined
    };
  }

  /**
   * Run cleanup manually (for testing or immediate execution)
   */
  static async runCleanupNow(): Promise<any> {
    try {
      console.log('Running manual cleanup of inactive participants...');
      const result = await UserManagementService.cleanupInactiveParticipants();
      console.log('Manual cleanup completed:', result.message);
      return result;
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      throw error;
    }
  }
} 