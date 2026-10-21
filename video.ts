import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { experimental_generateVideo as generateVideo } from 'ai';

const help = `Vercel AI Gateway · Video CLI (may incur usage charges)
Usage: npm run video -- "Describe a scene"
Required: AI_GATEWAY_VIDEO_MODEL=provider/video-model
Optional: AI_GATEWAY_VIDEO_OUTPUT=generated-video.mp4
Authentication: AI_GATEWAY_API_KEY (local) or VERCEL_OIDC_TOKEN (Vercel).
No model call is made with --help.`;

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(help);
    return;
  }

  const prompt = process.argv.slice(2).join(' ').trim();
  const model = process.env.AI_GATEWAY_VIDEO_MODEL?.trim();
  if (!prompt) throw new Error('Missing scene description. Run npm run video -- --help');
  if (!model || !/^[a-z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(model)) {
    throw new Error('Set AI_GATEWAY_VIDEO_MODEL to a supported live video model ID.');
  }
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error('AI Gateway credentials missing. Set AI_GATEWAY_API_KEY or use Vercel OIDC.');
  }

  const output = resolve(process.cwd(), process.env.AI_GATEWAY_VIDEO_OUTPUT || 'generated-video.mp4');
  const result = await generateVideo({ model, prompt });
  const data = result.videos?.[0]?.uint8Array;
  if (!data?.length) throw new Error('The selected video model returned no video.');
  writeFileSync(output, data, { flag: 'wx' });
  console.log('Video saved:', output);
}

main().catch((error: unknown) => {
  console.error('Video generation failed:', error instanceof Error ? error.message : 'Unknown failure');
  process.exitCode = 1;
});
