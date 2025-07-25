import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import User from '../models/User';

const router = express.Router();

// Time restriction middleware
const checkSubmissionTime = (req: AuthRequest, res: Response, next: any) => {
  const now = new Date();
  const hour = now.getHours();
  
  // Allow submissions from 7 AM to 11:59 PM (7-23)
  if (hour >= 7 && hour <= 23) {
    next();
  } else {
    return res.status(400).json({ 
      message: 'Project submissions are only allowed between 7:00 AM and 11:59 PM' 
    });
  }
};

// Submit a new project
router.post('/submit-project', authenticateToken, checkSubmissionTime, [
    body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
    body('description').trim().isLength({ min: 150 }).withMessage('Description must be at least 150 characters'),
    body('liveLink').isURL().withMessage('Please provide a valid live link URL'),
    body('githubLink').isURL().withMessage('Please provide a valid GitHub link URL'),
    body('technologies').isArray({ min: 1 }).withMessage('At least one technology must be selected')
], async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, liveLink, githubLink, technologies } = req.body;

        const project = new Project({
            userId: req.user!._id,
            name,
            description,
            liveLink,
            githubLink,
            technologies
        });

        await project.save();

        // Update user streak
        const user = await User.findById(req.user!._id);
        if (user) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Get total project count for this user
            const totalProjects = await Project.countDocuments({ userId: req.user!._id });
            
            // Check if user has reached 30 projects (including this submission)
            const hasReachedThirty = totalProjects >= 30;
            
            // If user has reached 30 projects, preserve their streak permanently
            if (hasReachedThirty && !user.hasReachedThirtyProjects) {
                user.hasReachedThirtyProjects = true;
                // Preserve current streak and longest streak - don't reset them
            }
            
            // Calculate points based on streak length
            // Points = current streak * 10 (so a 5-day streak = 50 points)
            const newPoints = user.currentStreak * 10;
            
            // Only award points if this is a new streak milestone or first submission
            if (!user.lastSubmissionDate || user.currentStreak === 1) {
                user.points = newPoints;
            } else {
                // For consecutive days, award the difference in points
                const previousPoints = (user.currentStreak - 1) * 10;
                const pointsDifference = newPoints - previousPoints;
                user.points += pointsDifference;
            }
            
            const lastSubmission = user.lastSubmissionDate ? new Date(user.lastSubmissionDate) : null;
            if (lastSubmission) {
                lastSubmission.setHours(0, 0, 0, 0);
            }

            // Only update streak if user hasn't reached 30 projects or if they're still actively submitting
            if (!user.hasReachedThirtyProjects) {
                if (!user.firstSubmissionDate) {
                    // First submission ever
                    user.firstSubmissionDate = today;
                    user.currentStreak = 1;
                    user.longestStreak = 1;
                } else if (!lastSubmission) {
                    // No previous submission (shouldn't happen but just in case)
                    user.currentStreak = 1;
                    user.longestStreak = Math.max(user.longestStreak, 1);
                } else {
                    const daysDiff = Math.floor((today.getTime() - lastSubmission.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff === 1) {
                        // Consecutive day - increment streak
                        user.currentStreak += 1;
                        user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
                    } else if (daysDiff === 0) {
                        // Same day submission - don't change streak
                        // Do nothing
                    } else {
                        // Missed a day or more - reset streak to 1
                        user.currentStreak = 1;
                    }
                }
            }
            // If user has reached 30 projects, their streak is preserved and won't be reset
            
            user.lastSubmissionDate = today;
            await user.save();
        }

        res.status(201).json({
            message: 'Project submitted successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                liveLink: project.liveLink,
                githubLink: project.githubLink,
                technologies: project.technologies,
                submittedAt: project.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's projects
router.get('/my-projects', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const projects = await Project.find({ userId: req.user!._id }).sort({ createdAt: -1 });

        res.json({
            projects: projects.map(project => ({
                id: project._id,
                name: project.name,
                description: project.description,
                liveLink: project.liveLink,
                githubLink: project.githubLink,
                technologies: project.technologies,
                submittedAt: project.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all participants with stats
router.get('/admin/participants', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user!._id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden' });
        }

        const participants = await User.find({ 
            role: 'participant', 
            isDeleted: false 
        }).select('fullName email createdAt hasReachedThirtyProjects currentStreak longestStreak points');

        const participantsWithStats = await Promise.all(
            participants.map(async (participant) => {
                const projects = await Project.find({ userId: participant._id });
                
                // Use stored streak data if user has reached 30 projects, otherwise calculate current streak
                let currentStreak = 0;
                
                if (participant.hasReachedThirtyProjects) {
                    // User has reached 30 projects - use their preserved streak
                    currentStreak = participant.currentStreak;
                } else if (projects.length > 0) {
                    // Calculate current streak for users who haven't reached 30 projects
                    const projectDates = [...new Set(projects.map(p => 
                        p.createdAt.toISOString().split('T')[0]
                    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                    
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    
                    // Start from the most recent project date and count consecutive days
                    let checkDate = new Date(projectDates[0]);
                    
                    // If the most recent project is not today, check if it's within the last 2 days to be considered "current"
                    const daysSinceLastProject = Math.floor((today.getTime() - checkDate.getTime()) / (24 * 60 * 60 * 1000));
                    
                    if (daysSinceLastProject <= 1) { // Allow 1 day gap (yesterday is still current)
                        // Count consecutive days backwards from the most recent project
                        let i = 0;
                        while (i < projectDates.length) {
                            const expectedDateStr = new Date(checkDate.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            if (projectDates.includes(expectedDateStr)) {
                                currentStreak++;
                                i++;
                            } else {
                                break;
                            }
                        }
                    }
                }

                return {
                    id: participant._id,
                    name: participant.fullName,
                    email: participant.email,
                    projectCount: projects.length,
                    streakCount: currentStreak,
                    hasReachedThirtyProjects: participant.hasReachedThirtyProjects,
                    points: participant.points,
                    joinedAt: participant.createdAt,
                };
            })
        );

        res.json({ participants: participantsWithStats });
    } catch (error) {
        console.error('Admin participants error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user streak information
router.get('/my-streak', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            lastSubmissionDate: user.lastSubmissionDate,
            firstSubmissionDate: user.firstSubmissionDate,
            hasReachedThirtyProjects: user.hasReachedThirtyProjects
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all projects (for public view)
router.get('/all', async (req: any, res: Response) => {
    try {
        const projects = await Project.find()
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({
            projects: projects.map(project => ({
                id: project._id,
                name: project.name,
                description: project.description,
                liveLink: project.liveLink,
                githubLink: project.githubLink,
                technologies: project.technologies,
                submittedAt: project.createdAt,
                user: {
                    name: (project.userId as any).fullName,
                    email: (project.userId as any).email
                }
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;