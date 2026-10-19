import { prisma, isDatabaseConnected } from './prisma.js';
import { store } from './store.js';

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
          details: input.details,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent
        }
      });
    } else {
      store.auditLogs.unshift({
        id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        ...input,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
}
