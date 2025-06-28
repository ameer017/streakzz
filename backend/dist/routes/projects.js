"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Project_1 = __importDefault(require("../models/Project"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Time restriction middleware
const checkSubmissionTime = (req, res, next) => {
    const now = new Date();
    const hour = now.getHours();
    // Allow submissions from 7 AM to 11:59 PM (7-23)
    if (hour >= 7 && hour <= 23) {
        next();
    }
    else {
        return res.status(400).json({
            message: 'Project submissions are only allowed between 7:00 AM and 11:59 PM'
        });
    }
};
// Submit a new project
router.post('/submit-project', auth_1.authenticateToken, checkSubmissionTime, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    (0, express_validator_1.body)('liveLink').isURL().withMessage('Please provide a valid live link URL'),
    (0, express_validator_1.body)('githubLink').isURL().withMessage('Please provide a valid GitHub link URL')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description, liveLink, githubLink } = req.body;
        const project = new Project_1.default({
            userId: req.user._id,
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Get user's projects
router.get('/my-projects', auth_1.authenticateToken, async (req, res) => {
    try {
        const projects = await Project_1.default.find({ userId: req.user._id }).sort({ createdAt: -1 });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Admin: Get all participants with stats
router.get('/admin/participants', auth_1.authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User_1.default.findById(req.user._id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden' });
        }
        const participants = await User_1.default.find({
            role: 'participant',
            isDeleted: false
        }).select('fullName email createdAt');
        const participantsWithStats = await Promise.all(participants.map(async (participant) => {
            const projects = await Project_1.default.find({ userId: participant._id });
            // Calculate streak
            const today = new Date();
            let currentStreak = 0;
            for (let i = 0; i < 365; i++) {
                const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                const dateKey = date.toISOString().split('T')[0];
                const dayProjects = projects.filter(p => p.createdAt.toISOString().split('T')[0] === dateKey);
                if (dayProjects.length > 0) {
                    currentStreak++;
                }
                else {
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
        }));
        res.json({ participants: participantsWithStats });
    }
    catch (error) {
        console.error('Admin participants error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get all projects (for admin or public view)
router.get('/all', auth_1.authenticateToken, async (req, res) => {
    try {
        const projects = await Project_1.default.find()
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
                    name: project.userId.fullName,
                    email: project.userId.email
                }
            }))
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
