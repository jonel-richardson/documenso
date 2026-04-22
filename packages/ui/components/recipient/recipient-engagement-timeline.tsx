import type { ReactNode } from 'react';

import { Plural, Trans } from '@lingui/react/macro';
import { CalendarIcon, EyeIcon } from 'lucide-react';
import { DateTime } from 'luxon';

import type { TRecipientViewEvent } from '@documenso/lib/types/recipient-engagement';
import { cn } from '@documenso/ui/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@documenso/ui/primitives/popover';
import { Skeleton } from '@documenso/ui/primitives/skeleton';

export type RecipientEngagementTimelineProps = {
  /**
   * Recipient email — shown in the popover header.
   */
  recipientEmail: string;

  /**
   * Open events for this recipient, ordered most-recent-first.
   * Pass an empty array when no events exist yet.
   */
  events: TRecipientViewEvent[];

  /**
   * Total open count (may be larger than `events.length` if paginated).
   */
  openCount: number;

  /**
   * Whether the timeline is currently loading (e.g. waiting on tRPC).
   */
  isLoading?: boolean;

  /**
   * Whether there are more events beyond the current list.
   * When true, a "Load more" affordance can be shown (future P1 pagination).
   */
  hasMore?: boolean;

  /**
   * Trigger element — typically the RecipientEngagementBadge.
   * Clicking it opens the popover.
   */
  trigger: ReactNode;

  className?: string;
};

/**
 * A click-triggered popover that shows the full timeline of open events for
 * one recipient, ordered most-recent-first.
 *
 * STUB STATUS: Accepts typed props matching TRecipientViewEvent[]. The parent
 * component (document-page-view-recipients.tsx) currently passes stub data.
 * Wire in the real `recipient.getEngagementTimeline` tRPC call once the
 * backend migration + procedure exist.
 */
export const RecipientEngagementTimeline = ({
  recipientEmail,
  events,
  openCount,
  isLoading = false,
  hasMore = false,
  trigger,
  className,
}: RecipientEngagementTimelineProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className={cn('w-72 p-0', className)}
        data-testid="recipient-engagement-timeline"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <EyeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={recipientEmail}>
              {recipientEmail}
            </p>
            <p className="text-xs text-muted-foreground">
              {openCount === 0 ? (
                <Trans>No opens recorded</Trans>
              ) : (
                <Plural value={openCount} one="# open total" other="# opens total" />
              )}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-64 overflow-y-auto" role="list" aria-label="View event timeline">
          {isLoading && (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground/70">
                <Trans>This recipient hasn't opened the document yet.</Trans>
              </p>
            </div>
          )}

          {!isLoading && events.length > 0 && (
            <ul className="divide-y">
              {events.map((event, i) => {
                const dt = DateTime.fromJSDate(event.viewedAt);

                return (
                  <li
                    key={event.id}
                    role="listitem"
                    className="flex items-center gap-3 px-4 py-2.5"
                    data-testid={`engagement-event-${i}`}
                  >
                    <CalendarIcon
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                      aria-hidden="true"
                    />
                    <div className="flex-1 text-xs">
                      {/* Relative time — primary label */}
                      <p className="font-medium text-foreground/80">
                        {dt.toRelative({ style: 'long' })}
                      </p>
                      {/* Absolute time — accessible secondary label */}
                      <time
                        dateTime={dt.toISO() ?? ''}
                        className="text-muted-foreground/60"
                        title={dt.toLocaleString(DateTime.DATETIME_FULL)}
                      >
                        {dt.toLocaleString(DateTime.DATETIME_MED)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — load more hint (P1 pagination hook) */}
        {hasMore && !isLoading && (
          <div className="border-t px-4 py-2.5">
            <p className="text-center text-xs text-muted-foreground/60">
              <Trans>Showing most recent opens only</Trans>
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
