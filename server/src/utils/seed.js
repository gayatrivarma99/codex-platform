require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const Assessment = require('../models/Assessment');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Notification = require('../models/Notification');
const { achievementsData, problemsData } = require('./seedData');

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codex_platform'
    );
    console.log(`Connected to DB for seeding: ${conn.connection.host}`);

    // Clear existing collections
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
    await Contest.deleteMany({});
    await Assessment.deleteMany({});
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});
    await Notification.deleteMany({});
    console.log('🧹 Existing collections cleaned.');

    // 1. Create Achievements
    const createdAchievements = await Achievement.insertMany(achievementsData);
    console.log(`🏆 Created ${createdAchievements.length} achievements.`);

    // 2. Create Users
    const admin = await User.create({
      name: 'Admin Director',
      username: 'admin',
      email: 'admin@codex.dev',
      password: 'admin123',
      role: 'admin',
      bio: 'Head Administrator of the Codex Platform.',
      rating: 2100,
      streak: { current: 15, longest: 30, lastSolvedDate: new Date() },
    });

    const instructor = await User.create({
      name: 'Dr. Alan Turing',
      username: 'dr_alan',
      email: 'instructor@codex.dev',
      password: 'instructor123',
      role: 'instructor',
      bio: 'Algorithms Instructor and Competitive Programmer.',
      rating: 1950,
      streak: { current: 8, longest: 14, lastSolvedDate: new Date() },
    });

    const alex = await User.create({
      name: 'Alex Rivera',
      username: 'alex_coder',
      email: 'alex@codex.dev',
      password: 'student123',
      role: 'student',
      bio: 'CS student striving for FAANG & Grandmaster rating.',
      rating: 1680,
      streak: { current: 5, longest: 12, lastSolvedDate: new Date() },
    });

    const maria = await User.create({
      name: 'Maria Chen',
      username: 'maria_dev',
      email: 'maria@codex.dev',
      password: 'student123',
      role: 'student',
      bio: 'Backend enthusiast passionate about clean code & DP.',
      rating: 1820,
      streak: { current: 9, longest: 16, lastSolvedDate: new Date() },
    });

    const sarah = await User.create({
      name: 'Sarah Connor',
      username: 'sarah_algo',
      email: 'sarah@codex.dev',
      password: 'student123',
      role: 'student',
      bio: 'Algorithmic puzzle solver & open-source contributor.',
      rating: 1540,
      streak: { current: 2, longest: 4, lastSolvedDate: new Date() },
    });

    console.log('👤 Created Users: admin, instructor, alex, maria, sarah.');

    // 3. Create Problems
    const problemsWithCreator = problemsData.map((p) => ({
      ...p,
      createdBy: instructor._id,
      totalSubmissions: Math.floor(Math.random() * 40 + 20),
      acceptedSubmissions: Math.floor(Math.random() * 15 + 10),
    }));

    const createdProblems = await Problem.insertMany(problemsWithCreator);
    console.log(`🧩 Created ${createdProblems.length} realistic coding problems.`);

    // 4. Mark some problems solved for users & create sample submissions
    const twoSum = createdProblems.find((p) => p.slug === 'two-sum');
    const validParentheses = createdProblems.find((p) => p.slug === 'valid-parentheses');
    const maxSubarray = createdProblems.find((p) => p.slug === 'maximum-subarray');
    const stock = createdProblems.find((p) => p.slug === 'best-time-to-buy-and-sell-stock');
    const palindrome = createdProblems.find((p) => p.slug === 'valid-palindrome');

    alex.solvedProblems = [twoSum._id, validParentheses._id, stock._id];
    await alex.save();

    maria.solvedProblems = [twoSum._id, validParentheses._id, maxSubarray._id, stock._id, palindrome._id];
    await maria.save();

    sarah.solvedProblems = [twoSum._id];
    await sarah.save();

    // 5. Create Submissions
    const sampleSubmissions = [
      {
        user: alex._id,
        problem: twoSum._id,
        language: 'javascript',
        code: twoSum.starterCode.javascript,
        status: 'Accepted',
        executionTime: 42,
        memoryUsed: 22,
        testCasesPassed: 4,
        totalTestCases: 4,
        submittedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        user: alex._id,
        problem: validParentheses._id,
        language: 'python',
        code: validParentheses.starterCode.python,
        status: 'Accepted',
        executionTime: 88,
        memoryUsed: 16,
        testCasesPassed: 5,
        totalTestCases: 5,
        submittedAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        user: alex._id,
        problem: maxSubarray._id,
        language: 'javascript',
        code: 'console.log("wrong answer attempt");',
        status: 'Wrong Answer',
        executionTime: 38,
        memoryUsed: 20,
        testCasesPassed: 1,
        totalTestCases: 4,
        submittedAt: new Date(),
      },
      {
        user: maria._id,
        problem: twoSum._id,
        language: 'python',
        code: twoSum.starterCode.python,
        status: 'Accepted',
        executionTime: 65,
        memoryUsed: 17,
        testCasesPassed: 4,
        totalTestCases: 4,
        submittedAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        user: maria._id,
        problem: maxSubarray._id,
        language: 'javascript',
        code: maxSubarray.starterCode.javascript,
        status: 'Accepted',
        executionTime: 45,
        memoryUsed: 23,
        testCasesPassed: 4,
        totalTestCases: 4,
        submittedAt: new Date(Date.now() - 1 * 86400000),
      },
    ];

    await Submission.insertMany(sampleSubmissions);
    console.log('📝 Created sample submissions.');

    // 6. Create User Achievements
    const firstStepBadge = createdAchievements.find((a) => a.code === 'first_problem');
    const apprenticeBadge = createdAchievements.find((a) => a.code === 'solved_5');

    if (firstStepBadge) {
      await UserAchievement.create({ user: alex._id, achievement: firstStepBadge._id });
      await UserAchievement.create({ user: maria._id, achievement: firstStepBadge._id });
      await UserAchievement.create({ user: sarah._id, achievement: firstStepBadge._id });
    }
    if (apprenticeBadge) {
      await UserAchievement.create({ user: maria._id, achievement: apprenticeBadge._id });
    }

    // 7. Create Contests
    const now = new Date();
    // Live Contest: Started 45 minutes ago, ends in 75 minutes
    const liveStart = new Date(now.getTime() - 45 * 60000);
    const liveEnd = new Date(now.getTime() + 75 * 60000);

    // Upcoming Contest: Starts tomorrow
    const upcomingStart = new Date(now.getTime() + 24 * 3600000);
    const upcomingEnd = new Date(now.getTime() + 26 * 3600000);

    // Completed Contest: Ended 2 days ago
    const completedStart = new Date(now.getTime() - 48 * 3600000);
    const completedEnd = new Date(now.getTime() - 46 * 3600000);

    const contests = [
      {
        title: 'Codex Weekly Contest 101',
        slug: 'codex-weekly-contest-101',
        description: 'Test your algorithmic agility with 4 brand new coding problems!',
        startTime: liveStart,
        endTime: liveEnd,
        duration: 120,
        status: 'live',
        problems: [
          { problem: twoSum._id, points: 100, order: 1 },
          { problem: validParentheses._id, points: 200, order: 2 },
          { problem: maxSubarray._id, points: 300, order: 3 },
        ],
        participants: [
          {
            user: maria._id,
            score: 300,
            penalty: 35,
            submissions: [
              { problem: twoSum._id, status: 'Accepted', solvedAt: liveStart, points: 100 },
              { problem: validParentheses._id, status: 'Accepted', solvedAt: now, points: 200 },
            ],
          },
          {
            user: alex._id,
            score: 100,
            penalty: 20,
            submissions: [
              { problem: twoSum._id, status: 'Accepted', solvedAt: liveStart, points: 100 },
            ],
          },
        ],
        createdBy: instructor._id,
      },
      {
        title: 'Codex Grand Prix 2026',
        slug: 'codex-grand-prix-2026',
        description: 'The premier competitive programming championship. Cash prizes and badges for top rankers.',
        startTime: upcomingStart,
        endTime: upcomingEnd,
        duration: 120,
        status: 'upcoming',
        problems: [
          { problem: stock._id, points: 100, order: 1 },
          { problem: palindrome._id, points: 200, order: 2 },
        ],
        participants: [{ user: alex._id }],
        createdBy: admin._id,
      },
      {
        title: 'Winter CodeSprint 2025',
        slug: 'winter-codesprint-2025',
        description: 'Completed annual tournament of 2025.',
        startTime: completedStart,
        endTime: completedEnd,
        duration: 120,
        status: 'completed',
        problems: [
          { problem: twoSum._id, points: 100, order: 1 },
          { problem: validParentheses._id, points: 200, order: 2 },
        ],
        participants: [
          { user: maria._id, score: 300, penalty: 25 },
          { user: alex._id, score: 100, penalty: 40 },
        ],
        createdBy: instructor._id,
      },
    ];

    await Contest.insertMany(contests);
    console.log('⚔️ Created Live, Upcoming, and Completed Contests.');

    // 8. Create Assessments
    const assessment = await Assessment.create({
      title: 'Full-Stack Software Engineer Algorithm Evaluation',
      code: 'CODEX-EVAL-2026',
      description: 'Official technical assessment covering data structures, dynamic programming, and string parsing.',
      startTime: new Date(now.getTime() - 24 * 3600000),
      endTime: new Date(now.getTime() + 7 * 24 * 3600000),
      duration: 90,
      passingScore: 65,
      problems: [
        { problem: twoSum._id, points: 100 },
        { problem: validParentheses._id, points: 100 },
        { problem: maxSubarray._id, points: 150 },
      ],
      candidates: [
        {
          email: 'alex@codex.dev',
          user: alex._id,
          status: 'completed',
          score: 200,
          totalPoints: 350,
          passed: false,
        },
        {
          email: 'maria@codex.dev',
          user: maria._id,
          status: 'completed',
          score: 350,
          totalPoints: 350,
          passed: true,
        },
        {
          email: 'candidate@example.com',
          status: 'invited',
        },
      ],
      createdBy: instructor._id,
    });
    console.log(`📋 Created Assessment: ${assessment.title} (Code: ${assessment.code})`);

    // 9. Create Notifications
    await Notification.create([
      {
        user: alex._id,
        title: '⚔️ Contest Live: Codex Weekly Contest 101',
        message: 'The contest has started! Join now to test your problem solving skills.',
        type: 'contest',
        link: '/contests/codex-weekly-contest-101',
      },
      {
        user: alex._id,
        title: '🏆 Achievement Unlocked',
        message: 'You earned the "First Step" badge for solving your first problem!',
        type: 'achievement',
        link: '/profile/alex_coder',
      },
      {
        user: maria._id,
        title: '📋 Assessment Assigned',
        message: 'You have been invited to Full-Stack Software Engineer Algorithm Evaluation.',
        type: 'assessment',
        link: '/assessments',
      },
    ]);
    console.log('🔔 Created sample notifications.');

    console.log('✨ Database seeding complete successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
