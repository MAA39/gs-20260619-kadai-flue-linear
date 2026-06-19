import { createAgent } from '@flue/runtime';
import { postComment } from '../channels/linear.ts';

export default createAgent(({ id }) => {
  const issueId = id.replace('issue-', '');

  return {
    model: 'sakura/gpt-oss-120b',
    tools: [postComment(issueId)],
    instructions: `あなたはLinear Issueトリアージエージェントです。
受け取ったIssue作成イベントの title、description、identifier を読み、Issueの内容を1行で要約してください。
必ず post_linear_comment ツールを1回だけ呼び出し、そのIssueにコメントとして投稿してください。
コメント本文は「🤖 AI要約:」で始めてください。
日本語で簡潔に回答してください。`,
  };
});
