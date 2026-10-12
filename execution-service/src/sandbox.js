const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

/**
 * Creates an isolated temporary directory for code execution.
 */
function createTempSandbox() {
  const sandboxBase = path.join(os.tmpdir(), 'codex_sandbox');
  if (!fs.existsSync(sandboxBase)) {
    fs.mkdirSync(sandboxBase, { recursive: true });
  }
  return fs.mkdtempSync(path.join(sandboxBase, 'run_'));
}

/**
 * Cleans up temporary directory recursively.
 */
function cleanupSandbox(dirPath) {
  try {
    if (dirPath && fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Failed to clean up sandbox directory ${dirPath}:`, err.message);
  }
}

/**
 * Executes a process inside sandbox with strict timeout and output restrictions.
 */
function runProcess({
  command,
  args = [],
  stdinData = '',
  cwd,
  timeoutMs = 4000,
  maxOutputBytes = 64 * 1024,
}) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    let stdoutData = '';
    let stderrData = '';
    let isTimedOut = false;
    let isTerminated = false;

    // Minimal sanitized environment variables
    const sanitizedEnv = {
      PATH: process.env.PATH || '',
      SYSTEMROOT: process.env.SYSTEMROOT || '',
      TEMP: cwd,
      TMP: cwd,
      PYTHONUNBUFFERED: '1',
      NODE_ENV: 'production',
    };

    let child;
    try {
      child = spawn(command, args, {
        cwd,
        env: sanitizedEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });
    } catch (err) {
      return resolve({
        status: 'Runtime Error',
        error: `Failed to spawn process: ${err.message}`,
        executionTime: 0,
        actualOutput: '',
      });
    }

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      if (stdoutData.length < maxOutputBytes) {
        stdoutData += data.toString();
        if (stdoutData.length > maxOutputBytes) {
          stdoutData = stdoutData.substring(0, maxOutputBytes) + '\n[Output Truncated: Exceeded Maximum Output Limit]';
        }
      }
    });

    child.stderr.on('data', (data) => {
      if (stderrData.length < maxOutputBytes) {
        stderrData += data.toString();
        if (stderrData.length > maxOutputBytes) {
          stderrData = stderrData.substring(0, maxOutputBytes);
        }
      }
    });

    if (stdinData) {
      try {
        child.stdin.write(stdinData);
      } catch (err) {}
    }
    child.stdin.end();

    child.on('error', (err) => {
      clearTimeout(timer);
      if (isTerminated) return;
      isTerminated = true;
      const endTime = process.hrtime.bigint();
      const executionTime = Number((endTime - startTime) / 1000000n);

      resolve({
        status: 'Runtime Error',
        error: err.message,
        executionTime,
        actualOutput: '',
      });
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (isTerminated) return;
      isTerminated = true;

      const endTime = process.hrtime.bigint();
      const executionTime = Number((endTime - startTime) / 1000000n);

      if (isTimedOut || signal === 'SIGKILL' || signal === 'SIGTERM') {
        return resolve({
          status: 'Time Limit Exceeded',
          error: `Execution timed out after ${timeoutMs}ms`,
          executionTime: timeoutMs,
          actualOutput: stdoutData.trim(),
        });
      }

      if (code !== 0) {
        return resolve({
          status: 'Runtime Error',
          error: stderrData.trim() || `Process exited with error code ${code}`,
          executionTime,
          actualOutput: stdoutData.trim(),
        });
      }

      resolve({
        status: 'Success',
        actualOutput: stdoutData,
        executionTime,
        error: null,
      });
    });
  });
}

module.exports = {
  createTempSandbox,
  cleanupSandbox,
  runProcess,
};
