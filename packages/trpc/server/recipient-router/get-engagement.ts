import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { buildTeamWhereQuery } from '@documenso/lib/utils/teams';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import { ZGetEngagementRequestSchema, ZGetEngagementResponseSchema } from './schema';

export const getEngagementRoute = authenticatedProcedure
  .input(ZGetEngagementRequestSchema)
  .output(ZGetEngagementResponseSchema)
  .query(async ({ input, ctx }) => {
    const { recipientId } = input;
    const { user, teamId } = ctx;

    ctx.logger.info({
      input: {
        recipientId,
      },
    });

    const recipient = await prisma.recipient.findFirst({
      where: {
        id: recipientId,
        envelope: {
          team: buildTeamWhereQuery({ teamId, userId: user.id }),
        },
      },
      include: {
        recipientViewEvents: {
          orderBy: { viewedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!recipient) {
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Recipient not found',
      });
    }

    return {
      openCount: recipient.openCount,
      firstOpenedAt: recipient.firstOpenedAt,
      lastOpenedAt: recipient.lastOpenedAt,
      events: recipient.recipientViewEvents,
      hasMore: recipient.openCount > recipient.recipientViewEvents.length,
    };
  });
