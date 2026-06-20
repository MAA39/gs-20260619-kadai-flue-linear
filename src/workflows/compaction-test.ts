import { createAgent, type FlueContext, type WorkflowRouteHandler } from '@flue/runtime';

export const route: WorkflowRouteHandler = async (_c, next) => next();

const testAgent = createAgent(() => ({
  model: 'sakura/gpt-oss-120b',
  instructions: [
    'あなたはCompaction検証用のエージェントです。',
    '外部データやコマンド実行は使わず、会話内で与えられた情報だけを使ってください。',
    '必ず日本語の本文を出力してください。thinkingだけで終わらせてはいけません。',
  ].join('\n'),
  compaction: {
    reserveTokens: 500,
    keepRecentTokens: 80,
  },
}));

const longContext = [
  '運用観点: webhook署名検証は最初に失敗しやすい。署名ヘッダー、raw body、secretの3点を同時に確認する。',
  '観測観点: Cloudflare Tracesでは処理の流れを見る。Flue run streamでは会話とイベントの中身を見る。',
  'ログ観点: durable_object_storage_exec OKはDurable Object SQLite操作の自動計装であり、通常の運用判断では追わない。',
  '検証観点: compaction_startとcompactionを同じrun streamで確認し、compaction.isError:falseを成功条件にする。',
  '表示観点: run streamは生JSONなので、message_start、text_delta、compactionイベントを人間向けに整形して読む。',
  '安全観点: thinking_deltaにはモデル内部の推論テキストが含まれるため、保存・閲覧・共有範囲は慎重に扱う。',
].join('\n');

export async function run({ init }: FlueContext) {
  const harness = await init(testAgent);
  const session = await harness.session();

  await session.prompt(
    [
      '以下は架空プロジェクト「Aster」のメモです。内容を保持してください。',
      'AsterはLinear Issueを受け取り、AIで1行要約し、元Issueへコメント返信する検証プロジェクトです。',
      '担当はMasa、期限は2026-06-30、最優先リスクはwebhook署名検証の失敗です。',
      longContext,
      '確認したら、1文で受け取ったことを返してください。',
    ].join('\n'),
  );
  await session.prompt(
    [
      '追加メモです。',
      '本番環境はCloudflare Workers、観測はCloudflare Traces、会話ログ確認はFlue run streamを使います。',
      'Compaction成功判定はcompactionイベントのisError:falseです。',
      longContext,
      '確認したら、1文で追加内容を返してください。',
    ].join('\n'),
  );
  await session.prompt(
    [
      'さらに追加メモです。',
      'run streamはmessage_startでユーザー入力、text_deltaでAI本文、compaction_startとcompactionで圧縮イベントを確認します。',
      'durable_object_storage_exec OKはCloudflareの内部ストレージ操作ログなので、通常は追いません。',
      longContext,
      '確認したら、1文で追加内容を返してください。',
    ].join('\n'),
  );

  await session.compact();

  const response = await session.prompt(
    [
      '圧縮後のコンテキストだけを使って、次の4点を1文で答えてください。',
      'プロジェクト名、担当、期限、最優先リスク。',
      '必ず「Asterは」で始まる日本語の本文を出力してください。',
    ].join('\n'),
  );

  return { summary: response.text, compacted: true };
}
