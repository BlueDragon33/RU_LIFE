import type { ControlServiceIdentity } from "./control-auth.server";
import { getRuLifeDatabase, RuLifeAccessError, type ControlRole } from "./device-registry.server";

export type RuLifeAutomationPolicy = {
  autoApproveDevices: boolean;
  revision: number;
};

type AutomationRow = {
  auto_approve_devices: number;
  revision: number;
};

type AutomationCommandRow = {
  command_id: string;
  payload_hash: string;
  state: "processing" | "completed" | "failed" | "uncertain";
  result_json: string | null;
  execution_nonce: string;
  error_code: string | null;
};

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function validCommandId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function readRuLifeAutomation(): Promise<RuLifeAutomationPolicy> {
  const database = await getRuLifeDatabase();
  const row = await database.prepare("SELECT auto_approve_devices, revision FROM ru_life_automation WHERE id = 1")
    .first<AutomationRow>();
  if (row) return { autoApproveDevices: row.auto_approve_devices === 1, revision: Number(row.revision) || 1 };

  // Preserve the policy from the existing Site's earlier audit-backed automation endpoint.
  const legacy = await database.prepare(
    "SELECT detail_json FROM ru_life_audit_log WHERE action = 'automation_updated' AND target = 'ru-life' ORDER BY id DESC LIMIT 1",
  ).first<{ detail_json: string }>();
  try {
    const detail = legacy ? JSON.parse(legacy.detail_json) as Record<string, unknown> : {};
    return { autoApproveDevices: detail.enabled === true, revision: 1 };
  } catch {
    return { autoApproveDevices: false, revision: 1 };
  }
}

export async function updateRuLifeAutomation(actor: string, role: ControlRole, enabled: boolean) {
  if (role !== "owner") throw new RuLifeAccessError("Chỉ Chủ hệ thống được đổi quy tắc duyệt tự động Hòa nhập Nga.", 403, "OWNER_REQUIRED");
  const database = await getRuLifeDatabase();
  await database.batch([
    database.prepare(`INSERT INTO ru_life_automation (id, auto_approve_devices, revision, updated_by)
      VALUES (1, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET auto_approve_devices = excluded.auto_approve_devices,
      revision = ru_life_automation.revision + 1, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`).bind(enabled ? 1 : 0, actor),
    database.prepare("INSERT INTO ru_life_audit_log (actor, action, target, detail_json) VALUES (?, 'automation_updated', 'ru-life', ?)")
      .bind(actor, JSON.stringify({ enabled })),
  ]);
  return readRuLifeAutomation();
}

async function commandRow(database: D1Database, commandId: string) {
  return database.prepare(
    `SELECT command_id,payload_hash,state,result_json,execution_nonce,error_code
       FROM ru_life_automation_commands WHERE command_id=?`,
  ).bind(commandId).first<AutomationCommandRow>();
}

export async function executeRuLifeAutomationCommand(identity: ControlServiceIdentity, payload: Record<string, unknown>) {
  if (identity.role !== "owner") throw new RuLifeAccessError("Chỉ Chủ hệ thống được đổi automation policy Hòa nhập Nga.", 403, "OWNER_REQUIRED");
  const commandId = typeof payload.commandId === "string" ? payload.commandId.trim().toLowerCase() : "";
  if (!validCommandId(commandId)) throw new RuLifeAccessError("commandId automation không hợp lệ.", 400, "INVALID_COMMAND_ID");
  if (payload.operation !== "set-device-automation") throw new RuLifeAccessError("Automation operation không hợp lệ.", 400, "INVALID_AUTOMATION_OPERATION");

  const expected = record(payload.expected);
  const desired = record(payload.desired);
  if (!("autoApproveDevices" in desired) || Object.keys(desired).some((key) => key !== "autoApproveDevices")) {
    throw new RuLifeAccessError("RU_LIFE Universal automation chỉ hỗ trợ autoApproveDevices.", 400, "UNSUPPORTED_AUTOMATION_FIELD");
  }
  if (typeof desired.autoApproveDevices !== "boolean" || typeof expected.autoApproveDevices !== "boolean") {
    throw new RuLifeAccessError("autoApproveDevices/expected không hợp lệ.", 400, "INVALID_AUTOMATION");
  }

  const canonical = JSON.stringify({
    operation: "set-device-automation",
    expected: { autoApproveDevices: expected.autoApproveDevices },
    desired: { autoApproveDevices: desired.autoApproveDevices },
  });
  const payloadHash = await sha256Hex(canonical);
  const database = await getRuLifeDatabase();

  const prior = await commandRow(database, commandId);
  if (prior) {
    if (prior.payload_hash !== payloadHash) throw new RuLifeAccessError("commandId automation đã được dùng cho payload khác.", 409, "COMMAND_ID_PAYLOAD_MISMATCH");
    if (prior.state === "completed" && prior.result_json) {
      return { commandId, replayed: true, automation: JSON.parse(prior.result_json) as RuLifeAutomationPolicy };
    }
    if (prior.state === "uncertain") throw new RuLifeAccessError("Lệnh automation trước cần đối chiếu lại.", 409, "COMMAND_RECONCILIATION_REQUIRED");
    if (prior.state === "failed") throw new RuLifeAccessError("Lệnh automation trước đã thất bại; cần đọc lại policy rồi tạo commandId mới.", 409, "COMMAND_PREVIOUSLY_FAILED");
    throw new RuLifeAccessError("Lệnh automation cùng commandId đang được xử lý.", 409, "COMMAND_IN_PROGRESS");
  }

  const current = await readRuLifeAutomation();
  if (current.autoApproveDevices !== expected.autoApproveDevices) {
    throw new RuLifeAccessError("Automation policy đã thay đổi trước khi lệnh được áp dụng.", 409, "AUTOMATION_STATE_CONFLICT");
  }

  const executionNonce = crypto.randomUUID();
  await database.prepare(
    `INSERT INTO ru_life_automation_commands
      (command_id,payload_hash,state,actor,control_device_id,ticket_id,execution_nonce)
     VALUES (?,?,'processing',?,?,?,?)`,
  ).bind(
    commandId,
    payloadHash,
    identity.actor,
    identity.controlDeviceId,
    identity.ticketId,
    executionNonce,
  ).run();

  try {
    const mutation = await database.prepare(
      `UPDATE ru_life_automation
          SET auto_approve_devices=?, revision=revision+1, updated_by=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=1 AND revision=?`,
    ).bind(desired.autoApproveDevices ? 1 : 0, identity.actor, current.revision).run();
    if (Number(mutation.meta.changes ?? 0) !== 1) {
      await database.prepare(
        "UPDATE ru_life_automation_commands SET state='failed',error_code='AUTOMATION_STATE_CONFLICT' WHERE command_id=? AND execution_nonce=?",
      ).bind(commandId, executionNonce).run();
      throw new RuLifeAccessError("Automation policy đã thay đổi trước khi ghi.", 409, "AUTOMATION_STATE_CONFLICT");
    }

    const updated = await readRuLifeAutomation();
    if (updated.autoApproveDevices !== desired.autoApproveDevices) {
      throw new RuLifeAccessError("Automation policy chưa xác nhận readback.", 502, "AUTOMATION_READBACK_MISMATCH");
    }

    await database.prepare("INSERT INTO ru_life_audit_log (actor, action, target, detail_json) VALUES (?, 'automation_command_applied', 'ru-life', ?)")
      .bind(identity.actor, JSON.stringify({ commandId, expected, desired, result: updated, controlDeviceId: identity.controlDeviceId })).run();
    await database.prepare(
      "UPDATE ru_life_automation_commands SET state='completed',result_json=?,completed_at=CURRENT_TIMESTAMP WHERE command_id=? AND execution_nonce=?",
    ).bind(JSON.stringify(updated), commandId, executionNonce).run();
    return { commandId, replayed: false, automation: updated };
  } catch (error) {
    if (!(error instanceof RuLifeAccessError && error.code === "AUTOMATION_STATE_CONFLICT")) {
      try {
        await database.prepare(
          "UPDATE ru_life_automation_commands SET state='uncertain',error_code='COMMAND_REQUIRES_RECONCILIATION' WHERE command_id=? AND execution_nonce=? AND state='processing'",
        ).bind(commandId, executionNonce).run();
      } catch {
        // Never blind-replay unresolved automation commands.
      }
    }
    throw error;
  }
}
