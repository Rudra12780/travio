const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\x1b[32m%s\x1b[0m', '==================================================');
console.log('\x1b[32m%s\x1b[0m', ' 🚀 Starting Trovio / GlobeTrotter Full Stack App');
console.log('\x1b[32m%s\x1b[0m', '==================================================');
console.log('📍 Frontend:    http://localhost:3000');
console.log('📍 Backend API: http://localhost:5000');
console.log('📍 Admin Gate:  http://localhost:3000/admin');
console.log('--------------------------------------------------\n');

// Start Backend
const isWindows = process.platform === 'win32';
const backendCmd = 'node';
const backendArgs = ['server.js'];

const backend = spawn(backendCmd, backendArgs, {
  cwd: backendDir,
  shell: isWindows,
  stdio: ['inherit', 'pipe', 'pipe']
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[BACKEND]\x1b[0m ${data.toString()}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[BACKEND ERROR]\x1b[0m ${data.toString()}`);
});

backend.on('close', (code) => {
  console.log(`\x1b[33m[BACKEND]\x1b[0m Process exited with code ${code}`);
});

// Start Frontend
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  shell: isWindows,
  stdio: ['inherit', 'pipe', 'pipe']
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[FRONTEND]\x1b[0m ${data.toString()}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[FRONTEND ERROR]\x1b[0m ${data.toString()}`);
});

frontend.on('close', (code) => {
  console.log(`\x1b[33m[FRONTEND]\x1b[0m Process exited with code ${code}`);
});

function cleanup() {
  console.log('\n🛑 Shutting down both services...');
  if (backend && !backend.killed) {
    try {
      if (isWindows && backend.pid) {
        spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      } else {
        backend.kill();
      }
    } catch (_) {}
  }
  if (frontend && !frontend.killed) {
    try {
      if (isWindows && frontend.pid) {
        spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
      } else {
        frontend.kill();
      }
    } catch (_) {}
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
