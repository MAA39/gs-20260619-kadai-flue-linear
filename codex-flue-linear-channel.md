# Flue Linear Channel 1/100

## Goal

Linear Issue creation should reach this local Flue project at `/channels/linear/webhook`, dispatch a triage agent, summarize the Issue with `sakura/gpt-oss-120b`, and post one Linear comment back to the same Issue.

## Scope

Do:

- Receive verified Linear Issue creation webhooks.
- Dispatch `src/agents/triage.ts`.
- Use Sakura AI to create a one-line Japanese summary.
- Post a comment beginning with `🤖 AI要約:`.

Do not:

- Create sub-issues.
- Send notifications.
- Touch Google Calendar.
- Assign tasks.
- Run coding agents.
- Create PRs.
- Build preview environments.

## Human-Owned Steps

1. Start a public tunnel to the local Flue server.
2. Create a Linear webhook pointed at `https://<tunnel-host>/channels/linear/webhook`.
3. Copy the Linear signing secret into `.env` as `LINEAR_WEBHOOK_SECRET`.
4. Restart `npm run dev`.

## Local Commands

```bash
cd /Users/maa/Documents/flue/flue-demo
npm run dev
```

Tunnel options:

```bash
ngrok http 3583
```

or:

```bash
cloudflared tunnel --url http://localhost:3583
```

Linear webhook URL:

```txt
https://<tunnel-host>/channels/linear/webhook
```

## Verification

- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=high`
- `npm run dev` logs `channels linear`
- Creating a Linear Issue adds a comment to that Issue.
