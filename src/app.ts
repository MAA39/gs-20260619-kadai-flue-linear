import { registerProvider } from '@flue/runtime';
import { flue } from '@flue/runtime/routing';
import { observe } from '@flue/runtime';
import { Hono } from 'hono';

type CloudflareSpan = {
  setAttribute(name: string, value: string | number | boolean): void;
};

type CloudflareTracing = {
  enterSpan(name: string, callback: (span: CloudflareSpan) => void): void;
};

registerProvider('sakura', {
  api: 'openai-completions',
  baseUrl: 'https://api.ai.sakura.ad.jp/v1',
  apiKey: process.env.SAKURA_API_TOKEN,
});

// Compaction検知: CF環境ではCustom Spans、Node.js環境ではstderr
async function setupCompactionDetection() {
  try {
    // @ts-expect-error cloudflare:workers is resolved only in Cloudflare Workers.
    const { tracing } = await import('cloudflare:workers') as { tracing: CloudflareTracing };
    observe((event) => {
      if (event.type === 'compaction') {
        tracing.enterSpan('flue.compaction', (span) => {
          span.setAttribute('compaction.duration_ms', event.durationMs ?? 0);
          span.setAttribute('compaction.is_error', event.isError ?? false);
          span.setAttribute('compaction.run_id', event.runId ?? '');
        });
      }
    });
  } catch {
    observe((event) => {
      if (event.type === 'compaction') {
        process.stderr.write(JSON.stringify({
          _flue: 'compaction', durationMs: event.durationMs, runId: event.runId,
        }) + '\n');
      }
    });
  }
}
setupCompactionDetection();

const app = new Hono();
app.get('/health', (c) => c.json({ status: 'ok' }));
app.route('/', flue());
export default app;
