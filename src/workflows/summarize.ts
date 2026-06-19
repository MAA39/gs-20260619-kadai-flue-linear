import { createAgent, type FlueContext, type WorkflowRouteHandler } from '@flue/runtime';

export const route: WorkflowRouteHandler = async (_c, next) => next();

const summarizer = createAgent(() => ({
  model: 'sakura/gpt-oss-120b',
}));

export async function run({ init, payload }: FlueContext<{ text: string }>) {
  const harness = await init(summarizer);
  const session = await harness.session();
  const response = await session.prompt(`以下のテキストを3行以内で要約してください:\n\n${payload.text}`);

  return { summary: response.text };
}
