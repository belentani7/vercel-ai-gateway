import 'dotenv/config';
import { generateText } from 'ai';

const help = `Vercel AI Gateway · Text CLI
Usage: npm run text -- "Your prompt"
Required: AI_GATEWAY_MODEL=provider/model
Authentication: AI_GATEWAY_API_KEY (local) or VERCEL_OIDC_TOKEN (Vercel).
No model call is made with --help.`;

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(help);
    return;
  }

  const prompt = process.argv.slice(2).join(' ').trim();
  const model = process.env.AI_GATEWAY_MODEL?.trim();
  if (!prompt) throw new Error('Missing prompt. Run npm run text -- --help');
  if (!model || !/^[a-z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(model)) {
    throw new Error('Set AI_GATEWAY_MODEL to a current provider/model or vmc/slug ID.');
  }
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error('AI Gateway credentials missing. Set AI_GATEWAY_API_KEY or use Vercel OIDC.');
  }

  const result = await generateText({ model, prompt });
  if (!result.text?.trim()) throw new Error('The model returned no text.');
  process.stdout.write(result.text.trim() + '\n');
}

main().catch((error: unknown) => {
  console.error('Generation failed:', error instanceof Error ? error.message : 'Unknown failure');
  process.exitCode = 1;
});
