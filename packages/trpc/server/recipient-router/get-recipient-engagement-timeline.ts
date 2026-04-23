import { EnvelopeType } from '@prisma/client';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { assertRateLimit } from '@documenso/lib/server-only/rate-limit/rate-limit-middleware';
import { recipientEngagementTimelineRateLimit } from '@documenso/lib/server-only/rate-limit/rate-limits';
import { getRecipientById } from '@documenso/lib/server-only/recipient/get-recipient-by-id';
import { getRecipientEngagementTimeline } from '@documenso/lib/server-only/recipient/get-recipient-engagement-timeline';
import { getTeamSettings } from '@documenso/lib/server-only/team/get-team-settings';
import { DOCUMENT_AUDIT_LOG_TYPE } from '@documenso/lib/types/document-audit-logs';
import { createDocumentAuditLogData } from '@documenso/lib/utils/document-audit-logs';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import {
  ZGetRecipientEngagementTimelineRequestSchema,
  ZGetRecipientEngagementTimelineResponseSchema,
  getRecipientEngagementTimelineMeta,
} from './get-recipient-engagement-timeline.types';

export const getRecipientEngagementTimelineRoute = authenticatedProcedure
  .meta(getRecipientEngagementTimelineMeta)
  .input(ZGetRecipientEngagementTimelineRequestSchema)
  .output(ZGetRecipientEngagementTimelineResponseSchema)
  .query(async ({ input, ctx }) => {
    const { teamId } = ctx;
    const { recipientId, cursor, limit } = input;

    const rateLimitResult = await recipientEngagementTimelineRateLimit.check({
      ip: ctx.metadata.requestMetadata.ipAddress ?? 'unknown',
      identifier: recipientId.toString(),
    });

    assertRateLimit(rateLimitResult);

    // Check auth/access
    const recipient = await getRecipientById({
      userId: ctx.user.id,
      teamId,
      recipientId,
      type: EnvelopeType.DOCUMENT,
    });

    const settings = await getTeamSettings({
      userId: ctx.user.id,
      teamId,
    });

    if (settings.engagementTrackingEnabled === false) {
      throw new AppError(AppErrorCode.FORBIDDEN, {
        message: 'Engagement tracking is disabled for this organization.',
      });
    }

    if (!cursor) {
      await prisma.documentAuditLog.create({
        data: createDocumentAuditLogData({
          type: DOCUMENT_AUDIT_LOG_TYPE.ENGAGEMENT_DATA_VIEWED_BY_SENDER,
          envelopeId: recipient.envelopeId,
          user: {
            name: ctx.user.name ?? '',
            email: ctx.user.email,
          },
          requestMetadata: ctx.metadata,
          data: {
            recipientId: recipient.id,
          },
        }),
      });
    }

    return await getRecipientEngagementTimeline({
      recipientId,
      cursor,
      limit,
    });
  });
