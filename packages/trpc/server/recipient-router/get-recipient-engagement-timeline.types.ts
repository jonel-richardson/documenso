import { z } from 'zod';

import type { TrpcRouteMeta } from '../trpc';

export const getRecipientEngagementTimelineMeta: TrpcRouteMeta = {
  openapi: {
    method: 'GET',
    path: '/recipient/{recipientId}/engagement-timeline',
    summary: 'Get recipient engagement timeline',
    description: 'Returns the view events for a recipient',
    tags: ['Document Recipients'],
  },
};

export const ZGetRecipientEngagementTimelineRequestSchema = z.object({
  recipientId: z.number(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const ZGetRecipientEngagementTimelineResponseSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      viewedAt: z.date(),
    }),
  ),
  nextCursor: z.string().nullable(),
});
