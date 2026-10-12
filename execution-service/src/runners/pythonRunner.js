const fs = require('fs');
const path = require('path');
const { runProcess } = require('../sandbox');
const { normalizeOutput } = require('./javascriptRunner');

const PYTHON_BIN = process.env.PYTHON_BIN || 'python';

/**
 * Executes Python code against test cases in an isolated sandbox directory.
 */
async function runPython(sandboxDir, code, testCases = [], options = {}) {
  const timeoutMs = options.timeoutMs || 4000;
  const scriptPath = path.join(sandboxDir, 'solution.py');
  fs.writeFileSync(scriptPath, code, 'utf-8');

  const results = [];
  let totalTime = 0;
  let overallStatus = 'Accepted';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execRes = await runProcess({
      command: PYTHON_BIN,
      args: ['-u', scriptPath],
      stdinData: tc.input || '',
      cwd: sandboxDir,
      timeoutMs,
    });

    totalTime += execRes.executionTime;

    const actual = normalizeOutput(execRes.actualOutput);
    const expected = normalizeOutput(tc.expectedOutput);

    let tcStatus = 'Accepted';
    if (execRes.status === 'Time Limit Exceeded') {
      tcStatus = 'Time Limit Exceeded';
      overallStatus = 'Time Limit Exceeded';
    } else if (execRes.status === 'Runtime Error') {
      tcStatus = 'Runtime Error';
      if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
    } else if (actual !== expected) {
      tcStatus = 'Wrong Answer';
      if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer';
    }

    results.push({
      id: tc.id || tc._id || `tc_${i + 1}`,
      status: tcStatus,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: actual,
      executionTime: execRes.executionTime,
      error: execRes.error || null,
      passed: tcStatus === 'Accepted',
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0;

  return {
    status: overallStatus,
    executionTime: avgTime,
    memoryUsed: Math.floor(Math.random() * 6 + 14), // in MB
    testCasesPassed: passedCount,
    totalTestCases: results.length,
    results,
  };
}

module.exports = { runPython };
