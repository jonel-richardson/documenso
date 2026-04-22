import { zodResolver } from '@hookform/resolvers/zod';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { EyeIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@documenso/ui/primitives/form/form';
import { Switch } from '@documenso/ui/primitives/switch';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const ZEngagementTrackingFormSchema = z.object({
  engagementTrackingEnabled: z.boolean(),
});

export type TEngagementTrackingFormSchema = z.infer<typeof ZEngagementTrackingFormSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type EngagementTrackingFormProps = {
  /**
   * Current value of the setting, sourced from OrganisationGlobalSettings.
   *
   * STUB: Pass `true` here until the backend field is available.
   * Once the tRPC procedure returns `engagementTrackingEnabled`, thread it
   * through from the settings page loader.
   */
  initialValue: boolean;

  /**
   * Called with the new value when the user submits the form.
   *
   * STUB: Wire this to `trpc.organisation.settings.update.useMutation()`
   * once the backend field is added to OrganisationGlobalSettings.
   */
  onSubmit: (value: boolean) => Promise<void>;

  /**
   * Whether the form should be disabled (e.g. user lacks permission).
   */
  disabled?: boolean;

  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Org-level switch that enables or disables recipient engagement tracking.
 *
 * When disabled at the org level:
 *   - No RecipientViewEvents are recorded (backend gate).
 *   - The RecipientEngagementBadge is hidden for all documents in the org.
 *
 * STUB STATUS: The `onSubmit` prop is a no-op stub in the settings page until
 * the backend `engagementTrackingEnabled` field + tRPC mutation are ready.
 * The form itself is complete and functional.
 */
export const EngagementTrackingForm = ({
  initialValue,
  onSubmit,
  disabled = false,
  className,
}: EngagementTrackingFormProps) => {
  const { t } = useLingui();

  const form = useForm<TEngagementTrackingFormSchema>({
    resolver: zodResolver(ZEngagementTrackingFormSchema),
    defaultValues: {
      engagementTrackingEnabled: initialValue,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data.engagementTrackingEnabled);
  });

  return (
    <Form {...form}>
      <fieldset
        disabled={disabled || form.formState.isSubmitting}
        className={cn('flex flex-col gap-6', className)}
      >
        <div>
          <div className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium">
              <Trans>Recipient Engagement Tracking</Trans>
            </h3>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            <Trans>
              When enabled, Documenso records each time a recipient opens a document for signing.
              Senders can see open counts and timestamps on the document detail page. No personally
              identifiable information beyond timestamps is captured.
            </Trans>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="engagementTrackingEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">
                    <Trans>Enable engagement tracking</Trans>
                  </FormLabel>

                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value ? (
                      <Trans>
                        Tracking is <strong>on</strong>. Open events are being recorded for all
                        documents in this organisation.
                      </Trans>
                    ) : (
                      <Trans>
                        Tracking is <strong>off</strong>. No open events are recorded and engagement
                        badges are hidden from senders.
                      </Trans>
                    )}
                  </FormDescription>
                </div>

                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t`Toggle recipient engagement tracking`}
                    data-testid="engagement-tracking-switch"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
              data-testid="engagement-tracking-save"
            >
              <Trans>Save</Trans>
            </Button>
          </div>
        </form>
      </fieldset>
    </Form>
  );
};
