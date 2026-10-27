import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { saveVideoWithoutOverwrite } from '../video-output.mjs';

async function withTemporaryDirectory(run) {
  const directory = await mkdtemp(join(tmpdir(), 'gateway-video-'));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('existing output is preserved without invoking the billable generator', async () => {
  await withTemporaryDirectory(async (directory) => {
    const output = join(directory, 'existing.mp4');
    await writeFile(output, 'original');
    let calls = 0;
    await assert.rejects(saveVideoWithoutOverwrite(output, async () => {
      calls += 1;
      return Buffer.from('replacement');
    }), { code: 'EEXIST' });
    assert.equal(calls, 0);
    assert.equal(await readFile(output, 'utf8'), 'original');
  });
});

test('existing symlink is rejected without invoking generation or changing its target', async () => {
  await withTemporaryDirectory(async (directory) => {
    const target = join(directory, 'target');
    const output = join(directory, 'linked.mp4');
    await writeFile(target, 'original');
    await symlink(target, output);
    let calls = 0;
    await assert.rejects(saveVideoWithoutOverwrite(output, async () => {
      calls += 1;
      return Buffer.from('replacement');
    }), { code: 'EEXIST' });
    assert.equal(calls, 0);
    assert.equal(await readFile(target, 'utf8'), 'original');
  });
});

test('generator rejection removes its reserved empty output', async () => {
  await withTemporaryDirectory(async (directory) => {
    const output = join(directory, 'failed.mp4');
    await assert.rejects(saveVideoWithoutOverwrite(output, async () => {
      throw new Error('provider unavailable');
    }), /provider unavailable/);
    await assert.rejects(stat(output), { code: 'ENOENT' });
  });
});

test('empty response removes its reserved output', async () => {
  await withTemporaryDirectory(async (directory) => {
    const output = join(directory, 'empty.mp4');
    await assert.rejects(saveVideoWithoutOverwrite(output, async () => new Uint8Array()), /returned no video/);
    await assert.rejects(stat(output), { code: 'ENOENT' });
  });
});

test('valid bytes are saved exactly to a private file', async () => {
  await withTemporaryDirectory(async (directory) => {
    const output = join(directory, 'generated.mp4');
    const bytes = Uint8Array.from([0, 1, 2, 254, 255]);
    await saveVideoWithoutOverwrite(output, async () => bytes);
    assert.deepEqual(await readFile(output), Buffer.from(bytes));
    if (process.platform !== 'win32') {
      assert.equal((await stat(output)).mode & 0o077, 0);
    }
  });
});

test('concurrent invocation cannot generate against an already reserved output', async () => {
  await withTemporaryDirectory(async (directory) => {
    const output = join(directory, 'reserved.mp4');
    let release;
    let started;
    const startedPromise = new Promise((resolve) => { started = resolve; });
    const hold = new Promise((resolve) => { release = resolve; });
    const first = saveVideoWithoutOverwrite(output, async () => {
      started();
      await hold;
      return Buffer.from('first');
    });
    await startedPromise;
    let secondCalls = 0;
    await assert.rejects(saveVideoWithoutOverwrite(output, async () => {
      secondCalls += 1;
      return Buffer.from('second');
    }), { code: 'EEXIST' });
    release();
    await first;
    assert.equal(secondCalls, 0);
    assert.equal(await readFile(output, 'utf8'), 'first');
  });
});
