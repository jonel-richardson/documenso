/**
 * Recipient engagement types.
 *
 * These types define the shape of engagement data that will be returned by
 * the tRPC procedures once the backend (Prisma migration + RecipientViewEvent
 * table) is in place. Components are typed against these now so that wiring
 * up the real data later requires no component changes.
 */

/**
 * Rollup counts and timestamps stored directly on the Recipient model.
 * Updated atomically each time a RecipientViewEvent is written.
 */
export type TRecipientEngagementRollup = {
  openCount: number;
  firstOpenedAt: Date | null;
  lastOpenedAt: Date | null;
};

/**
 * A single open event row from the RecipientViewEvent table.
 * One row is created every time a recipient opens the signing page.
 */
export type TRecipientViewEvent = {
  id: string;
  recipientId: number;
  viewedAt: Date;
};

/**
 * The full engagement payload returned by the timeline tRPC procedure.
 * Events are ordered most-recent-first.
 */
export type TRecipientEngagementTimeline = TRecipientEngagementRollup & {
  events: TRecipientViewEvent[];
  hasMore: boolean;
};
