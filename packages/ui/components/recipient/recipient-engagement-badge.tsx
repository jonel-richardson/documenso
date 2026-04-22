import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { DateTime } from 'luxon';

import type { TRecipientEngagementRollup } from '@documenso/lib/types/recipient-engagement';
import { cn } from '@documenso/ui/lib/utils';
import { Badge } from '@documenso/ui/primitives/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@documenso/ui/primitives/tooltip';

export type RecipientEngagementBadgeProps = TRecipientEngagementRollup & {
  /**
   * Whether engagement tracking is enabled at the org level.
   * When false the badge is not rendered at all.
   */
  isEnabled: boolean;
  className?: string;
};

/**
 * Displays a compact engagement badge showing how many times a recipient has
 * opened the document and when they last opened it.
 *
 * Renders nothing when `isEnabled` is false (org has disabled tracking).
 *
 * STUB STATUS: Props are typed and ready. Swap the hardcoded stub values in
 * document-page-view-recipients.tsx for real tRPC data once the backend
 * migration + `recipient.getEngagement` procedure are in place.
 */
export const RecipientEngagementBadge = ({
  isEnabled,
  openCount,
  firstOpenedAt,
  lastOpenedAt,
  className,
}: RecipientEngagementBadgeProps) => {
  const { t } = useLingui();

  if (!isEnabled) {
    return null;
  }

  const hasOpened = openCount > 0;

  const lastOpenedRelative = lastOpenedAt
    ? DateTime.fromJSDate(lastOpenedAt).toRelative({ style: 'short' })
    : null;

  const lastOpenedAbsolute = lastOpenedAt
    ? DateTime.fromJSDate(lastOpenedAt).toLocaleString(DateTime.DATETIME_MED)
    : null;

  const firstOpenedAbsolute = firstOpenedAt
    ? DateTime.fromJSDate(firstOpenedAt).toLocaleString(DateTime.DATETIME_MED)
    : null;

  // Build the accessible tooltip body.
  const tooltipLines: string[] = [];

  if (!hasOpened) {
    tooltipLines.push(t`Not yet opened`);
  } else {
    tooltipLines.push(openCount === 1 ? t`Opened 1 time` : t`Opened ${openCount} times`);

    if (firstOpenedAbsolute) {
      tooltipLines.push(t`First opened: ${firstOpenedAbsolute}`);
    }

    if (lastOpenedAbsolute) {
      tooltipLines.push(t`Last opened: ${lastOpenedAbsolute}`);
    }
  }

  const tooltipText = tooltipLines.join('\n');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={hasOpened ? 'secondary' : 'neutral'}
            className={cn(
              'cursor-default gap-1 font-normal',
              hasOpened ? 'text-muted-foreground' : 'border-dashed text-muted-foreground/50',
              className,
            )}
            aria-label={tooltipText}
            data-testid="recipient-engagement-badge"
          >
            {hasOpened ? (
              <EyeIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            )}

            {hasOpened ? (
              <span>
                {openCount}× · {lastOpenedRelative}
              </span>
            ) : (
              <span>
                <Trans>Not opened</Trans>
              </span>
            )}
          </Badge>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="max-w-[220px] whitespace-pre-line text-center text-xs"
          data-testid="recipient-engagement-badge-tooltip"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
