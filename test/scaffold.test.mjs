import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('scaffolds the requested Flue demo project', () => {
  assert.ok(existsSync(new URL('../package.json', import.meta.url)), 'package.json exists');
  assert.ok(existsSync(new URL('../flue.config.ts', import.meta.url)), 'flue.config.ts exists');
  assert.ok(existsSync(new URL('../src/app.ts', import.meta.url)), 'src/app.ts exists');
  assert.ok(existsSync(new URL('../src/agents/assistant.ts', import.meta.url)), 'assistant agent exists');
  assert.ok(existsSync(new URL('../src/agents/triage.ts', import.meta.url)), 'triage agent exists');
  assert.ok(existsSync(new URL('../src/channels/linear.ts', import.meta.url)), 'linear channel exists');
  assert.ok(existsSync(new URL('../src/workflows/summarize.ts', import.meta.url)), 'summarize workflow exists');
  assert.ok(
    existsSync(new URL('../codex-flue-linear-channel.md', import.meta.url)),
    'linear handoff doc exists',
  );

  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.type, 'module');
  assert.ok(pkg.dependencies?.['@flue/runtime']);
  assert.ok(pkg.dependencies?.['@flue/linear']);
  assert.ok(pkg.dependencies?.['@linear/sdk']);
  assert.ok(pkg.devDependencies?.['@flue/cli']);

  const app = read('src/app.ts');
  assert.match(app, /@flue\/runtime\/routing/);
  assert.match(app, /registerProvider\('sakura'/);
  assert.match(app, /https:\/\/api\.ai\.sakura\.ad\.jp\/v1/);
  assert.match(app, /SAKURA_API_TOKEN/);
  assert.match(app, /app\.route\('\/', flue\(\)\)/);

  const agent = read('src/agents/assistant.ts');
  assert.match(agent, /createAgent/);
  assert.match(agent, /sakura\/gpt-oss-120b/);
  assert.match(agent, /日本語で簡潔に回答してください/);

  const workflow = read('src/workflows/summarize.ts');
  assert.match(workflow, /export async function run/);
  assert.match(workflow, /WorkflowRouteHandler/);
  assert.match(workflow, /3行以内で要約してください/);

  const channel = read('src/channels/linear.ts');
  assert.match(channel, /flue-blueprint: channel\/linear@1/);
  assert.match(channel, /createLinearChannel/);
  assert.match(channel, /LINEAR_WEBHOOK_SECRET/);
  assert.match(channel, /LINEAR_API_KEY/);
  assert.match(channel, /payload\.type === 'Issue'/);
  assert.match(channel, /payload\.action === 'create'/);
  assert.match(channel, /dispatch\(triageAgent/);
  assert.match(channel, /post_linear_comment/);

  const triage = read('src/agents/triage.ts');
  assert.match(triage, /sakura\/gpt-oss-120b/);
  assert.match(triage, /postComment\(issueId\)/);
  assert.match(triage, /🤖 AI要約:/);

  const envExample = read('.env.example');
  assert.match(envExample, /LINEAR_API_KEY/);
  assert.match(envExample, /LINEAR_WEBHOOK_SECRET/);
});
