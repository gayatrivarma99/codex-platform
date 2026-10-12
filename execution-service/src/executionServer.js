require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createTempSandbox, cleanupSandbox } = require('./sandbox');
const { runJavaScript } = require('./runners/javascriptRunner');
const { runPython } = require('./runners/pythonRunner');
const { runCpp } = require('./runners/cppRunner');
const { runJava } = require('./runners/javaRunner');

const app = express();
const PORT = process.env.PORT || 5050;
const EXECUTION_SECRET = process.env.EXECUTION_SECRET || 'codex_internal_secret_sandbox_token_2026';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Internal auth middleware
app.use('/api', (req, res, next) => {
  const secret = req.headers['x-execution-secret'];
  if (EXECUTION_SECRET && secret !== EXECUTION_SECRET) {
    return res.status(403).json({ error: 'Unauthorized: Invalid execution secret' });
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'codex-execution-service',
    timestamp: new Date().toISOString(),
    supportedLanguages: ['javascript', 'python', 'cpp', 'java'],
  });
});

// Execute code against test cases
app.post('/api/execute', async (req, res) => {
  const { language, code, testCases = [], timeoutMs = 4000, memoryLimitMb = 64 } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required' });
  }

  if (!Array.isArray(testCases)) {
    return res.status(400).json({ error: 'testCases must be an array' });
  }

  const normalizedLang = String(language).toLowerCase().trim();
  let sandboxDir = null;

  try {
    sandboxDir = createTempSandbox();
    let result;

    switch (normalizedLang) {
      case 'javascript':
      case 'js':
      case 'node':
        result = await runJavaScript(sandboxDir, code, testCases, { timeoutMs, memoryLimitMb });
        break;

      case 'python':
      case 'python3':
      case 'py':
        result = await runPython(sandboxDir, code, testCases, { timeoutMs, memoryLimitMb });
        break;

      case 'cpp':
      case 'c++':
        result = await runCpp(sandboxDir, code, testCases, { timeoutMs, memoryLimitMb });
        break;

      case 'java':
        result = await runJava(sandboxDir, code, testCases, { timeoutMs, memoryLimitMb });
        break;

      default:
        return res.status(400).json({
          error: `Unsupported language: ${language}. Supported: javascript, python, cpp, java`,
        });
    }

    res.json(result);
  } catch (err) {
    console.error('Execution service error:', err);
    res.status(500).json({
      status: 'Internal Server Error',
      error: err.message,
      executionTime: 0,
      memoryUsed: 0,
      testCasesPassed: 0,
      totalTestCases: testCases.length,
      results: [],
    });
  } finally {
    if (sandboxDir) {
      cleanupSandbox(sandboxDir);
    }
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ Isolated Execution Service running on port ${PORT}`);
  });
}

module.exports = app;
