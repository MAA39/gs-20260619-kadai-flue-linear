import { registerProvider } from '@flue/runtime';
import { flue } from '@flue/runtime/routing';
import { Hono } from 'hono';

registerProvider('sakura', {
  api: 'openai-completions',
  baseUrl: 'https://api.ai.sakura.ad.jp/v1',
  apiKey: process.env.SAKURA_API_TOKEN,
});

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok' }));
app.route('/', flue());

export default app;
