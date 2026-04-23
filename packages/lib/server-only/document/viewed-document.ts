import { EnvelopeType, ReadStatus, SendStatus, WebhookTriggerEvents } from '@prisma/client';

import { DOCUMENT_AUDIT_LOG_TYPE } from '@documenso/lib/types/document-audit-logs';
import type { RequestMetadata } from '@documenso/lib/universal/extract-request-metadata';
import { createDocumentAuditLogData } from '@documenso/lib/utils/document-audit-logs';
import { prisma } from '@documenso/prisma';

import type { TDocumentAccessAuthTypes } from '../../types/document-auth';
import {
  ZWebhookDocumentSchema,
  mapEnvelopeToWebhookDocumentPayload,
} from '../../types/webhook-payload';
import { triggerWebhook } from '../webhooks/trigger/trigger-webhook';

export type ViewedDocumentOptions = {
  token: string;
  recipientAccessAuth?: TDocumentAccessAuthTypes[];
  requestMetadata?: RequestMetadata;
};

export const viewedDocument = async ({
  token,
  recipientAccessAuth,
  requestMetadata,
}: ViewedDocumentOptions) => {
  const recipient = await prisma.recipient.findFirst({
    where: {
      token,
      envelope: {
        type: EnvelopeType.DOCUMENT,
      },
    },
  });

  if (!recipient) {
    return;
  }

  await prisma.documentAuditLog.create({
    data: createDocumentAuditLogData({
      type: DOCUMENT_AUDIT_LOG_TYPE.DOCUMENT_VIEWED,
      envelopeId: recipient.envelopeId,
      user: {
        name: recipient.name,
        email: recipient.email,
      },
      requestMetadata,
      data: {
        recipientEmail: recipient.email,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientRole: recipient.role,
        accessAuth: recipientAccessAuth ?? [],
      },
    }),
  });

  const isFirstOpen = recipient.readStatus !== ReadStatus.OPENED;

  await prisma.$transaction(async (tx) => {
    await tx.recipientViewEvent.create({
      data: {
        recipientId: recipient.id,
      },
    });

    await tx.recipient.update({
      where: {
        id: recipient.id,
      },
      data: {
        openCount: {
          increment: 1,
        },
        firstOpenedAt: recipient.firstOpenedAt ?? new Date(),
        lastOpenedAt: new Date(),
        ...(isFirstOpen
          ? {
              sendStatus: SendStatus.SENT,
              readStatus: ReadStatus.OPENED,
              ...(!recipient.sentAt ? { sentAt: new Date() } : {}),
            }
          : {}),
      },
    });

    await tx.documentAuditLog.create({
      data: createDocumentAuditLogData({
        type: DOCUMENT_AUDIT_LOG_TYPE.RECIPIENT_VIEW_RECORDED,
        envelopeId: recipient.envelopeId,
        user: {
          name: recipient.name,
          email: recipient.email,
        },
        requestMetadata,
        data: {
          recipientEmail: recipient.email,
          recipientId: recipient.id,
          recipientName: recipient.name,
          recipientRole: recipient.role,
          accessAuth: recipientAccessAuth ?? [],
        },
      }),
    });

    if (isFirstOpen) {
      await tx.documentAuditLog.create({
        data: createDocumentAuditLogData({
          type: DOCUMENT_AUDIT_LOG_TYPE.DOCUMENT_OPENED,
          envelopeId: recipient.envelopeId,
          user: {
            name: recipient.name,
            email: recipient.email,
          },
          requestMetadata,
          data: {
            recipientEmail: recipient.email,
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientRole: recipient.role,
            accessAuth: recipientAccessAuth ?? [],
          },
        }),
      });
    }
  });

  if (!isFirstOpen) {
    return;
  }

  // Don't schedule reminders for manually distributed documents —
  // there's no email pathway to send them through.

  const envelope = await prisma.envelope.findUniqueOrThrow({
    where: {
      id: recipient.envelopeId,
    },
    include: {
      documentMeta: true,
      recipients: true,
    },
  });

  await triggerWebhook({
    event: WebhookTriggerEvents.DOCUMENT_OPENED,
    data: ZWebhookDocumentSchema.parse(mapEnvelopeToWebhookDocumentPayload(envelope)),
    userId: envelope.userId,
    teamId: envelope.teamId,
  });
};
