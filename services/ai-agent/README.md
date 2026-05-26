# AI Agent Service

Minimal MVP service for AI-assisted financial intent drafting on the Ancore platform.

## Overview

The AI agent parses natural-language prompts into **draft** payment or invoice intents. It never executes any financial operation autonomously — all outputs require explicit user confirmation before any on-chain action is taken.

## Endpoints

### `GET /health`

Returns service liveness status.

```json
{ "status": "ok", "service": "ai-agent" }
```

### `POST /agent/draft-intent`

Parses a prompt into a draft financial intent.

**Request body:**

```json
{
  "prompt": "Send 10 XLM to Alice",
  "accountId": "GABC...",
  "context": {}
}
```

**Response:**

```json
{
  "status": "draft",
  "requiresConfirmation": true,
  "summary": "Draft payment intent parsed from: \"Send 10 XLM to Alice\"",
  "intent": {
    "type": "payment",
    "destination": "",
    "amount": "0",
    "asset": "XLM",
    "memo": "Send 10 XLM to Alice"
  }
}
```

## Security Boundaries

### What this service does

- Parses natural-language prompts into structured draft intents
- Returns typed, human-reviewable output for user confirmation
- Enforces the no-autonomous-execution guardrail on every response

### What this service does NOT do

- **No on-chain execution** — the service never submits transactions to Stellar
- **No key management** — no private keys are held or accessed
- **No fund movement** — zero financial operations are performed without explicit user confirmation
- **No persistent state** — no user data or financial state is stored

### Guardrail enforcement

Every response from `/agent/draft-intent` is validated by `enforceNoAutonomousExecution` before being returned. This function throws if:

- `status` is anything other than `"draft"`
- `requiresConfirmation` is not `true`

This is a hard invariant: the agent is a **suggestion engine only**.

## Limitations

- The current intent parser is a stub (keyword-based). Replace with a real LLM/NLP integration before production use.
- Parsed `amount` and `destination` fields are placeholders — the real parser must extract these from the prompt.
- No authentication or rate limiting is implemented in this MVP. Add these before exposing the service externally.
- This service is classified as **Medium Risk** per the Ancore security model (`services/**`).

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## Status

MVP scaffold — not production-ready. See [issue #420](https://github.com/ancore-org/ancore/issues/420) and the [roadmap](../../README.md#roadmap) for planned work.
