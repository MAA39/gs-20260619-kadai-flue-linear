import json, sys

events = json.load(sys.stdin)
for e in events:
    t = e.get('type', '')
    if t == 'run_start':
        print(f"=== RUN START: {e.get('workflowName')} ({e.get('startedAt')}) ===\n")
    elif t == 'operation_start':
        print(f"--- {e.get('operationKind')} start ---")
    elif t == 'message_start' and e.get('message', {}).get('role') == 'user':
        text = ''.join(c.get('text', '') for c in e['message'].get('content', []))
        print(f"\n[USER] {text}\n")
    elif t == 'message_start' and e.get('message', {}).get('role') == 'assistant':
        m = e.get('message', {})
        print(f"[AI model={m.get('model','?')}] ", end='')
    elif t == 'text_delta':
        print(e.get('text', ''), end='')
    elif t == 'message_end' and e.get('message', {}).get('role') == 'assistant':
        print("\n")
    elif t == 'operation_end':
        kind = e.get('operationKind', '')
        dur = e.get('durationMs', 0)
        print(f"--- {kind} end ({dur}ms) ---\n")
    elif t == 'run_end':
        print(f"=== RUN END ({e.get('durationMs', 0)}ms) ===")
