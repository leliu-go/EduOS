export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | { [key: string]: AuditJsonValue };

export type AuditLogJson = Exclude<AuditJsonValue, null>;

export type AuditLogCreateData = {
  tenantId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: AuditLogJson;
  afterJson?: AuditLogJson;
  reason?: string | null;
};

export type AuditLogClient = {
  auditLog: {
    create(args: { data: AuditLogCreateData }): Promise<unknown>;
  };
};

export type WriteAuditLogInput = Omit<AuditLogCreateData, "beforeJson" | "afterJson"> & {
  beforeJson?: unknown;
  afterJson?: unknown;
};

const redactedValue = "[REDACTED]";
const sensitiveKeyPattern =
  /(password|passwordHash|secret|token|cookie|authorization|apiKey|accessKey|refreshToken|session)/i;

function normalizePrimitive(value: unknown): AuditJsonValue | undefined {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : String(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return undefined;
}

function redactAuditJsonValue(value: unknown, seen: WeakSet<object>): AuditJsonValue | undefined {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  const primitive = normalizePrimitive(value);

  if (primitive !== undefined || value === null) {
    return primitive;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactAuditJsonValue(item, seen) ?? null);
  }

  if (typeof value === "object" && value) {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    const output: Record<string, AuditJsonValue> = {};

    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (sensitiveKeyPattern.test(key)) {
        output[key] = redactedValue;
        continue;
      }

      const redacted = redactAuditJsonValue(entryValue, seen);

      if (redacted !== undefined) {
        output[key] = redacted;
      }
    }

    seen.delete(value);

    return output;
  }

  return String(value);
}

export function redactAuditJson(value: unknown) {
  return redactAuditJsonValue(value, new WeakSet<object>());
}

function redactAuditLogJson(value: unknown): AuditLogJson | undefined {
  const redacted = redactAuditJson(value);

  return redacted === null ? undefined : redacted;
}

async function getAuditLogClient(): Promise<AuditLogClient> {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
}

export async function writeAuditLog(input: WriteAuditLogInput, client?: AuditLogClient) {
  const auditLogClient = client ?? (await getAuditLogClient());

  return auditLogClient.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeJson: redactAuditLogJson(input.beforeJson),
      afterJson: redactAuditLogJson(input.afterJson),
      reason: input.reason ?? null,
    },
  });
}
