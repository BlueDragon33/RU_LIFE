import { getRuLifeDatabase, RuLifeAccessError, type ControlRole } from "./device-registry.server";

export async function readRuLifeAutomation() {
  const database = await getRuLifeDatabase();
  const row = await database.prepare("SELECT auto_approve_devices FROM ru_life_automation WHERE id = 1")
    .first<{ auto_approve_devices: number }>();
  if (row) return { autoApproveDevices: row.auto_approve_devices === 1 };

  // Preserve the policy from the existing Site's earlier audit-backed automation endpoint.
  const legacy = await database.prepare(
    "SELECT detail_json FROM ru_life_audit_log WHERE action = 'automation_updated' AND target = 'ru-life' ORDER BY id DESC LIMIT 1",
  ).first<{ detail_json: string }>();
  try {
    const detail = legacy ? JSON.parse(legacy.detail_json) as Record<string, unknown> : {};
    return { autoApproveDevices: detail.enabled === true };
  } catch {
    return { autoApproveDevices: false };
  }
}

export async function updateRuLifeAutomation(actor: string, role: ControlRole, enabled: boolean) {
  if (role !== "owner") throw new RuLifeAccessError("Chỉ Chủ hệ thống được đổi quy tắc duyệt tự động Hòa nhập Nga.", 403, "OWNER_REQUIRED");
  const database = await getRuLifeDatabase();
  await database.batch([
    database.prepare(`INSERT INTO ru_life_automation (id, auto_approve_devices, updated_by)
      VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET auto_approve_devices = excluded.auto_approve_devices,
      updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`).bind(enabled ? 1 : 0, actor),
    database.prepare("INSERT INTO ru_life_audit_log (actor, action, target, detail_json) VALUES (?, 'automation_updated', 'ru-life', ?)")
      .bind(actor, JSON.stringify({ enabled })),
  ]);
  return readRuLifeAutomation();
}
