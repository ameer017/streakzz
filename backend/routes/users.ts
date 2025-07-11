import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import User from '../models/User';
import { UserManagementService } from '../services/userManagement';
import { SchedulerService } from '../services/scheduler';

const router = express.Router();

// Get user profile with streak data
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user account is deleted
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const projects = await Project.find({ userId: user._id }).sort({ createdAt: -1 });

    // Generate streak data for the last 365 days
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const streakData: { [key: string]: number } = {};
    
    // Initialize all dates with 0
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      streakData[dateKey] = 0;
    }
    
    // Count projects per day
    projects.forEach(project => {
      const dateKey = project.createdAt.toISOString().split('T')[0];
      if (streakData[dateKey] !== undefined) {
        streakData[dateKey]++;
      }
    });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: fullUser.role,
        joinedAt: user.createdAt
      },
      stats: {
        totalProjects: projects.length,
        streakData,
        points: fullUser.points
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public user profile by ID
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    // Generate streak data for the last 365 days
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const streakData: { [key: string]: number } = {};
    
    // Initialize all dates with 0
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      streakData[dateKey] = 0;
    }
    
    // Count projects per day
    projects.forEach((project) => {
      const dateKey = project.createdAt.toISOString().split('T')[0];
      if (streakData[dateKey] !== undefined) {
        streakData[dateKey]++;
      }
    });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        joinedAt: user.createdAt
      },
      stats: {
        totalProjects: projects.length,
        streakData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get participant statistics (admin only)
router.get('/admin/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user is admin
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted || fullUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const stats = await UserManagementService.getParticipantStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup inactive participants (admin only)
router.post('/admin/cleanup', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user is admin
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted || fullUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const result = await UserManagementService.cleanupInactiveParticipants();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get scheduler status (admin only)
router.get('/admin/scheduler/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user is admin
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted || fullUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const status = SchedulerService.getSchedulerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start scheduler (admin only)
router.post('/admin/scheduler/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user is admin
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted || fullUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { schedule } = req.body;
    SchedulerService.startCleanupScheduler(schedule);
    
    const status = SchedulerService.getSchedulerStatus();
    res.json({ message: 'Scheduler started successfully', status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Stop scheduler (admin only)
router.post('/admin/scheduler/stop', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user is admin
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted || fullUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    SchedulerService.stopCleanupScheduler();
    
    const status = SchedulerService.getSchedulerStatus();
    res.json({ message: 'Scheduler stopped successfully', status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Run cleanup now (admin only)
router.post('/admin/cleanup/now', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Check if user is admin
    const fullUser = await User.findById(user._id);
    if (!fullUser || fullUser.isDeleted || fullUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const result = await SchedulerService.runCleanupNow();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 