const User = require('../models/User');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Notification = require('../models/Notification');

/**
 * Checks and awards achievements to a user based on their stats
 */
async function checkAndAwardAchievements(userId, io = null) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const allAchievements = await Achievement.find();
    const existingUserAchievements = await UserAchievement.find({ user: userId });
    const unlockedIds = new Set(existingUserAchievements.map((ua) => ua.achievement.toString()));

    const solvedCount = user.solvedProblems ? user.solvedProblems.length : 0;
    const currentStreak = user.streak ? user.streak.current : 0;

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement._id.toString())) {
        continue; // Already unlocked
      }

      let qualified = false;
      const { type, target } = achievement.criteria || {};

      if (type === 'problems_solved' && solvedCount >= target) {
        qualified = true;
      } else if (type === 'streak_days' && currentStreak >= target) {
        qualified = true;
      }

      if (qualified) {
        await UserAchievement.create({
          user: userId,
          achievement: achievement._id,
        });

        // Create notification
        const notification = await Notification.create({
          user: userId,
          title: `🏆 Achievement Unlocked: ${achievement.title}`,
          message: achievement.description,
          type: 'achievement',
          link: `/profile/${user.username}`,
        });

        // Emit real-time notification if socket is available
        if (io) {
          io.to(`user_${userId}`).emit('notification', notification);
        }
      }
    }
  } catch (err) {
    console.error('Error checking achievements:', err.message);
  }
}

module.exports = { checkAndAwardAchievements };
