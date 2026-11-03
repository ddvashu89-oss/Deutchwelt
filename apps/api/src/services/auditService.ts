import { prisma, isDatabaseConnected } from './prisma.js';
import { store } from './store.js';
import { writeSystemLog } from './systemLogging.js';

export interface AuditLogInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordAuditLog(input: AuditLogInput) {
  try {
    if (isDatabaseConnected) {
      await prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          details: input.details
        }
      });
      await writeSystemLog({
        userId: input.userId,
        level: 'INFO',
        source: 'audit',
        event: input.action,
        message: `${input.action} on ${input.entityType}`,
        context: { entityType: input.entityType, entityId: input.entityId || null, details: input.details }
      });
    } else {
      store.auditLogs.unshift({
        id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        details: input.details,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
}
