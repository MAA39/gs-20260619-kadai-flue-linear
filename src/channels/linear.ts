// flue-blueprint: channel/linear@1
import { createLinearChannel, type LinearWebhookPayload } from '@flue/linear';
import { defineTool, dispatch } from '@flue/runtime';
import { LinearClient } from '@linear/sdk';
import type { EntityWebhookPayloadWithIssueData } from '@linear/sdk/webhooks';
import triageAgent from '../agents/triage.ts';

const organizationId = process.env.LINEAR_ORGANIZATION_ID;
const webhookId = process.env.LINEAR_WEBHOOK_ID;

export const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY!,
});

export const channel = createLinearChannel({
  webhookSecret: process.env.LINEAR_WEBHOOK_SECRET!,
  ...(organizationId ? { organizationId } : {}),
  ...(webhookId ? { webhookId } : {}),

  // Path: /channels/linear/webhook
  async webhook({ payload, deliveryId }): Promise<undefined> {
    if (payload.type === 'Issue' && payload.action === 'create' && isIssueEvent(payload)) {
      await dispatch(triageAgent, {
        id: `issue-${payload.data.id}`,
        input: {
          type: 'linear.issue.created',
          deliveryId,
          actor: payload.actor,
          issue: payload.data,
        },
      });
    }

    return undefined;
  },
});

function isIssueEvent(payload: LinearWebhookPayload): payload is EntityWebhookPayloadWithIssueData {
  return payload.type === 'Issue' && 'title' in payload.data && 'id' in payload.data;
}

export function postComment(issueId: string) {
  return defineTool({
    name: 'post_linear_comment',
    description: 'LinearのIssueにコメントを投稿する',
    parameters: {
      type: 'object',
      properties: { text: { type: 'string', minLength: 1 } },
      required: ['text'],
      additionalProperties: false,
    },
    async execute({ text }) {
      const result = await client.createComment({
        issueId,
        body: text,
      });

      return JSON.stringify({ success: result.success, commentId: result.commentId });
    },
  });
}
