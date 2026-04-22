import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { canExecuteOrganisationAction } from '@documenso/lib/utils/organisations';
import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { OrganisationDeleteDialog } from '~/components/dialogs/organisation-delete-dialog';
import { AvatarImageForm } from '~/components/forms/avatar-image';
import { EngagementTrackingForm } from '~/components/forms/engagement-tracking-form';
import { OrganisationUpdateForm } from '~/components/forms/organisation-update-form';
import { SettingsHeader } from '~/components/general/settings-header';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Settings`);
}

export default function OrganisationSettingsGeneral() {
  const { _, t } = useLingui();

  const organisation = useCurrentOrganisation();
  const { toast } = useToast();

  const { mutateAsync: updateSettings } = trpc.organisation.settings.update.useMutation();

  const handleEngagementSubmit = async (enabled: boolean) => {
    await updateSettings({
      organisationId: organisation.id,
      data: { engagementTrackingEnabled: enabled },
    });
    toast({ title: t`Settings saved` });
  };

  return (
    <div className="max-w-2xl">
      <SettingsHeader
        title={_(msg`General`)}
        subtitle={_(msg`Here you can edit your organisation details.`)}
      />

      <div className="space-y-8">
        <AvatarImageForm organisation={organisation} />
        <OrganisationUpdateForm />

        <hr />

        {/* Engagement tracking toggle */}
        <EngagementTrackingForm
          initialValue={organisation.organisationGlobalSettings?.engagementTrackingEnabled ?? true}
          onSubmit={handleEngagementSubmit}
          disabled={
            !canExecuteOrganisationAction(
              'MANAGE_ORGANISATION',
              organisation.currentOrganisationRole,
            )
          }
        />
      </div>

      {canExecuteOrganisationAction(
        'DELETE_ORGANISATION',
        organisation.currentOrganisationRole,
      ) && (
        <>
          <hr className="my-4" />

          <Alert
            className="flex flex-col justify-between p-6 sm:flex-row sm:items-center"
            variant="neutral"
          >
            <div className="mb-4 sm:mb-0">
              <AlertTitle>
                <Trans>Delete organisation</Trans>
              </AlertTitle>

              <AlertDescription className="mr-2">
                <Trans>
                  This organisation, and any associated data will be permanently deleted.
                </Trans>
              </AlertDescription>
            </div>

            <OrganisationDeleteDialog />
          </Alert>
        </>
      )}
    </div>
  );
}
