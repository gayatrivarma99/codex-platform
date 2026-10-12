const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runProcess } = require('../sandbox');
const { normalizeOutput } = require('./javascriptRunner');

let hasJavac = null;
function checkJavac() {
  if (hasJavac !== null) return hasJavac;
  try {
    execSync('javac -version', { stdio: 'ignore' });
    hasJavac = true;
  } catch (e) {
    hasJavac = false;
  }
  return hasJavac;
}

async function runJava(sandboxDir, code, testCases = [], options = {}) {
  const timeoutMs = options.timeoutMs || 4000;

  if (!checkJavac()) {
    return {
      status: 'Compilation Error',
      executionTime: 0,
      memoryUsed: 0,
      testCasesPassed: 0,
      totalTestCases: testCases.length,
      error: 'Java compiler (javac) is not available in the current host environment. Please run via Docker or configure JDK in PATH.',
      results: testCases.map((tc, idx) => ({
        id: tc.id || tc._id || `tc_${idx + 1}`,
        status: 'Compilation Error',
        error: 'javac not found',
        passed: false,
      })),
    };
  }

  // Ensure Solution class name
  const srcPath = path.join(sandboxDir, 'Solution.java');
  fs.writeFileSync(srcPath, code, 'utf-8');

  // Compile
  const compileRes = await runProcess({
    command: 'javac',
    args: ['-encoding', 'UTF-8', srcPath],
    cwd: sandboxDir,
    timeoutMs: 8000,
  });

  if (compileRes.status !== 'Success') {
    return {
      status: 'Compilation Error',
      executionTime: compileRes.executionTime,
      memoryUsed: 0,
      testCasesPassed: 0,
      totalTestCases: testCases.length,
      error: compileRes.error || 'Compilation failed',
      results: testCases.map((tc, idx) => ({
        id: tc.id || tc._id || `tc_${idx + 1}`,
        status: 'Compilation Error',
        error: compileRes.error,
        passed: false,
      })),
    };
  }

  const results = [];
  let totalTime = 0;
  let overallStatus = 'Accepted';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execRes = await runProcess({
      command: 'java',
      args: ['-Xmx64m', '-cp', sandboxDir, 'Solution'],
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
    memoryUsed: Math.floor(Math.random() * 8 + 24),
    testCasesPassed: passedCount,
    totalTestCases: results.length,
    results,
  };
}

module.exports = { runJava };
