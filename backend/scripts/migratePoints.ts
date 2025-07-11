import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Project from '../models/Project';

dotenv.config();

const migratePoints = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streakzz';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let totalPointsAwarded = 0;
    let usersUpdated = 0;

    for (const user of users) {
      // Count projects for this user
      const projectCount = await Project.countDocuments({ userId: user._id });
      
      // Calculate points (10 points per project)
      const pointsToAward = projectCount * 10;
      
      // Update user's points
      if (pointsToAward > 0) {
        user.points = pointsToAward;
        await user.save();
        usersUpdated++;
        totalPointsAwarded += pointsToAward;
        
        console.log(`Updated ${user.fullName} (${user.email}): ${projectCount} projects = ${pointsToAward} points`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Users updated: ${usersUpdated}`);
    console.log(`Total points awarded: ${totalPointsAwarded}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migratePoints();
}

export default migratePoints; 