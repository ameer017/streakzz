import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Project from '../models/Project';

const router = express.Router();

// Submit a new project
router.post('/submit-project', authenticateToken, [
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

export default router;