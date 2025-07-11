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
      // Get projects for this user to calculate streak
      const projects = await Project.find({ userId: user._id }).sort({ createdAt: 1 });
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      if (projects.length > 0) {
        // Calculate streak from project dates
        const projectDates = [...new Set(projects.map(p => 
          p.createdAt.toISOString().split('T')[0]
        ))].sort();
        
        let previousDate = null;
        
        for (const dateStr of projectDates) {
          const currentDate = new Date(dateStr);
          
          if (previousDate === null) {
            tempStreak = 1;
          } else {
            const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              // Consecutive day
              tempStreak++;
            } else {
              // Break in streak
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
          
          previousDate = currentDate;
        }
        
        // Check final streak
        longestStreak = Math.max(longestStreak, tempStreak);
        currentStreak = tempStreak;
        
        // Update user's streak data
        user.currentStreak = currentStreak;
        user.longestStreak = longestStreak;
      }
      
      // Calculate points based on current streak (10 points per day in streak)
      const pointsToAward = currentStreak * 10;
      
      // Update user's points
      if (pointsToAward > 0) {
        user.points = pointsToAward;
        await user.save();
        usersUpdated++;
        totalPointsAwarded += pointsToAward;
        
        console.log(`Updated ${user.fullName} (${user.email}): ${projects.length} projects, ${currentStreak} day streak = ${pointsToAward} points`);
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