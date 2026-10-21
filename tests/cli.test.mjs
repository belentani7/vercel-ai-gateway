import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function execute(command, args = [], extra = {}) {
  return spawnSync('npm', ['run', command, '--', ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, AI_GATEWAY_API_KEY: '', VERCEL_OIDC_TOKEN: '', ...extra },
    timeout: 15000
  });
}

test('text CLI help works without credentials or a paid request', () => {
  const result = execute('text', ['--help']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /AI_GATEWAY_MODEL/);
});

test('video CLI help works without credentials or a paid request', () => {
  const result = execute('video', ['--help']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /charges/);
});

test('text CLI fails closed without a model', () => {
  const result = execute('text', ['Un ejemplo'], { AI_GATEWAY_MODEL: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AI_GATEWAY_MODEL/);
});

test('video CLI fails closed before calling a paid model', () => {
  const result = execute('video', ['Un ejemplo'], { AI_GATEWAY_VIDEO_MODEL: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AI_GATEWAY_VIDEO_MODEL/);
});
