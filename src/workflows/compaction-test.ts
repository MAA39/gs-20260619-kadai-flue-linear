import { createAgent, type FlueContext, type WorkflowRouteHandler } from '@flue/runtime';

export const route: WorkflowRouteHandler = async (_c, next) => next();

const testAgent = createAgent(() => ({
  model: 'sakura/gpt-oss-120b',
  compaction: {
    reserveTokens: 500,
    keepRecentTokens: 200,
  },
}));

export async function run({ init }: FlueContext) {
  const harness = await init(testAgent);
  const session = await harness.session();

  await session.prompt('日本の都道府県を全て列挙してください。県庁所在地も一緒にお願いします。');
  await session.prompt('それぞれの人口も追加してください。2024年時点の推計値で。');
  await session.prompt('面積も追加して、人口密度の高い順に並び替えてください。');

  await session.compact();

  const response = await session.prompt('圧縮後のコンテキストで、人口密度トップ3を答えてください。');

  return { summary: response.text, compacted: true };
}
