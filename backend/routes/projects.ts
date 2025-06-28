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
    body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    body('liveLink').isURL().withMessage('Please provide a valid live link URL'),
    body('githubLink').isURL().withMessage('Please provide a valid GitHub link URL')
], async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        const { name, description, liveLink, githubLink } = req.body;

        const project = new Project({
            userId: req.user!._id,
            name,
            description,
            liveLink,
            githubLink
        });

        await project.save();

        res.status(201).json({
            message: 'Project submitted successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                liveLink: project.liveLink,
                githubLink: project.githubLink,
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
        }).select('fullName email createdAt');

        const participantsWithStats = await Promise.all(
            participants.map(async (participant) => {
                const projects = await Project.find({ userId: participant._id });
                
                // Calculate streak
                const today = new Date();
                let currentStreak = 0;
                for (let i = 0; i < 365; i++) {
                    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateKey = date.toISOString().split('T')[0];
                    const dayProjects = projects.filter(p => 
                        p.createdAt.toISOString().split('T')[0] === dateKey
                    );
                    
                    if (dayProjects.length > 0) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }

                return {
                    id: participant._id,
                    name: participant.fullName,
                    email: participant.email,
                    projectCount: projects.length,
                    streakCount: currentStreak,
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

// Get all projects (for admin or public view)
router.get('/all', authenticateToken, async (req: AuthRequest, res: Response) => {
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