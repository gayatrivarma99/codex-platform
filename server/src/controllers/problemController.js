const slugify = require('slugify');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @desc    Get all problems with filtering, search, sorting, and pagination
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res, next) => {
  try {
    const {
      search,
      difficulty,
      topic,
      tag,
      status, // 'solved', 'unsolved'
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isPublished: true };

    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    if (topic) {
      query.topics = { $in: [new RegExp(topic, 'i')] };
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { topics: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Solved status filter if user is authenticated (via optional token or user check)
    let solvedIds = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select('solvedProblems');
      solvedIds = user?.solvedProblems || [];

      if (status === 'solved') {
        query._id = { $in: solvedIds };
      } else if (status === 'unsolved') {
        query._id = { $nin: solvedIds };
      }
    }

    const sortOptions = {};
    const sortDirection = order === 'asc' ? 1 : -1;

    if (sortBy === 'difficulty') {
      // Sort priority or standard
      sortOptions.difficulty = sortDirection;
    } else if (sortBy === 'acceptanceRate') {
      sortOptions.acceptedSubmissions = sortDirection;
    } else if (sortBy === 'popularity') {
      sortOptions.totalSubmissions = sortDirection;
    } else {
      sortOptions[sortBy] = sortDirection;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Problem.countDocuments(query);
    const problems = await Problem.find(query)
      .select('-testCases')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'username name');

    // Attach solved flag for user
    const solvedSet = new Set(solvedIds.map((id) => id.toString()));
    const problemsWithSolved = problems.map((p) => {
      const pObj = p.toObject();
      pObj.isSolved = solvedSet.has(p._id.toString());
      return pObj;
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      problems: problemsWithSolved,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single problem by slug
// @route   GET /api/problems/:slug
// @access  Public
exports.getProblemBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Fetch problem with test cases included for processing
    const problem = await Problem.findOne({ slug })
      .select('+testCases')
      .populate('createdBy', 'username name');

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: `Problem with slug '${slug}' not found`,
      });
    }

    // Role check to determine if hidden test cases should be shown
    const isOwnerOrAdmin =
      req.user &&
      (req.user.role === 'admin' ||
        (req.user.role === 'instructor' && problem.createdBy._id.toString() === req.user._id.toString()));

    const problemObj = problem.toObject();

    if (isOwnerOrAdmin) {
      // Creator/admin can see full test cases
      problemObj.testCases = problem.testCases;
    } else {
      // Normal students only see PUBLIC test cases
      problemObj.testCases = (problem.testCases || []).filter((tc) => tc.isPublic);
    }

    // Check if current user has solved it
    let isSolved = false;
    if (req.user) {
      const user = await User.findById(req.user.id).select('solvedProblems');
      if (user && user.solvedProblems) {
        isSolved = user.solvedProblems.some((id) => id.toString() === problem._id.toString());
      }
    }
    problemObj.isSolved = isSolved;

    res.status(200).json({
      success: true,
      problem: problemObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private (Instructor, Admin)
exports.createProblem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      difficulty,
      topics,
      tags,
      constraints,
      examples,
      inputFormat,
      outputFormat,
      hints,
      editorial,
      starterCode,
      testCases,
      timeLimit,
      memoryLimit,
      isPublished,
    } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and difficulty are required',
      });
    }

    // Generate unique slug
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Problem.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const problem = await Problem.create({
      title,
      slug,
      description,
      difficulty,
      topics: topics || [],
      tags: tags || [],
      constraints: constraints || [],
      examples: examples || [],
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      hints: hints || [],
      editorial: editorial || '',
      starterCode: starterCode || {},
      testCases: testCases || [],
      timeLimit: timeLimit || 2000,
      memoryLimit: memoryLimit || 64,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      problem,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private (Instructor, Admin)
exports.updateProblem = async (req, res, next) => {
  try {
    let problem = await Problem.findById(req.params.id).select('+testCases');

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    // Authorization check
    if (
      req.user.role !== 'admin' &&
      problem.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this problem',
      });
    }

    if (req.body.title && req.body.title !== problem.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('+testCases');

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private (Instructor, Admin)
exports.deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      problem.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this problem',
      });
    }

    await problem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all unique categories and tags
// @route   GET /api/problems/categories/all
// @access  Public
exports.getProblemCategories = async (req, res, next) => {
  try {
    const topics = await Problem.distinct('topics', { isPublished: true });
    const tags = await Problem.distinct('tags', { isPublished: true });

    res.status(200).json({
      success: true,
      topics: topics.filter(Boolean).sort(),
      tags: tags.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
};
