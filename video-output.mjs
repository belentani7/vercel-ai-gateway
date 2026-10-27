import { open, unlink } from 'node:fs/promises';

/** Reserve the destination before making a potentially billable generation request. */
export async function saveVideoWithoutOverwrite(output, generate) {
  // Exclusive creation rejects existing files and symlinks without calling generate.
  const handle = await open(output, 'wx', 0o600);
  let saved = false;
  try {
    const bytes = await generate();
    if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) {
      throw new Error('The selected video model returned no video.');
    }
    await handle.writeFile(bytes);
    await handle.sync();
    saved = true;
  } finally {
    try {
      await handle.close();
    } finally {
      if (!saved) {
        try {
          await unlink(output);
        } catch (error) {
          if (error?.code !== 'ENOENT') throw error;
        }
      }
    }
  }
}
