import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DraftIntentRequestSchema } from './types';
import type { DraftIntentResponse } from './types';
import { enforceNoAutonomousExecution } from './guardrail';

// ── Draft intent logic ────────────────────────────────────────────────────────

/**
 * Parses a natural-language prompt into a draft intent.
 * This is a stub — replace with real LLM/NLP integration.
 * The output is always a draft; no execution occurs here.
 */
function parseDraftIntent(prompt: string, accountId: string): DraftIntentResponse {
  const lower = prompt.toLowerCase();
  const isInvoice = lower.includes('invoice') || lower.includes('request');

  const response: DraftIntentResponse = isInvoice
    ? {
        status: 'draft',
        requiresConfirmation: true,
        summary: `Draft invoice request parsed from: "${prompt}"`,
        intent: {
          type: 'invoice',
          requestedBy: accountId,
          amount: '0',
          asset: 'XLM',
          description: prompt,
        },
      }
    : {
        status: 'draft',
        requiresConfirmation: true,
        summary: `Draft payment intent parsed from: "${prompt}"`,
        intent: {
          type: 'payment',
          destination: '',
          amount: '0',
          asset: 'XLM',
          memo: prompt,
        },
      };

  // Enforce guardrail before returning
  enforceNoAutonomousExecution(response);
  return response;
}

// ── Validation middleware ─────────────────────────────────────────────────────

function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid request', details: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}

// ── App factory ───────────────────────────────────────────────────────────────

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ai-agent' });
  });

  app.post(
    '/agent/draft-intent',
    validateBody(DraftIntentRequestSchema),
    (req: Request, res: Response) => {
      const { prompt, accountId } = req.body;
      const draft = parseDraftIntent(prompt, accountId);
      res.status(200).json(draft);
    }
  );

  return app;
}

// ── Entrypoint ────────────────────────────────────────────────────────────────

if (require.main === module) {
  const PORT = process.env['PORT'] ?? 3001;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`AI agent service listening on port ${PORT}`);
  });
}
