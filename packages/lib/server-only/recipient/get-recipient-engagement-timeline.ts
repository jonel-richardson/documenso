import { prisma } from '@documenso/prisma';

export type GetRecipientEngagementTimelineOptions = {
  recipientId: number;
  cursor?: string;
  limit?: number;
};

export const getRecipientEngagementTimeline = async ({
  recipientId,
  cursor,
  limit = 20,
}: GetRecipientEngagementTimelineOptions) => {
  const events = await prisma.recipientViewEvent.findMany({
    where: {
      recipientId,
    },
    take: limit + 1, // Get one extra to determine if there's a next page
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: {
      viewedAt: 'desc',
    },
  });

  let nextCursor: typeof cursor | null = null;
  if (events.length > limit) {
    const nextItem = events.pop(); // Remove the extra item
    nextCursor = nextItem!.id;
  }

  return {
    events: events.map((event) => ({
      id: event.id,
      viewedAt: event.viewedAt,
    })),
    nextCursor,
  };
};
