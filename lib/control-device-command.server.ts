import { getRuLifeDatabase, RuLifeAccessError, type ControlRole } from "./device-registry.server";

type DeviceStatus = "pending" | "approved" | "blocked";
type DeviceCommandOperation = "approve" | "block";

type ControlIdentity = {
  actor: string;
  role: ControlRole;
  controlDeviceId: string | null;
  ticketId: string | null;
};

type CommandRow = {
  command_id: string;
  device_id: string;
  operation: DeviceCommandOperation;
  expected_status: DeviceStatus;
  user_name: string | null;
  user_code: string | null;
  state: "processing" | "completed" | "failed" | "uncertain";
  result_status: DeviceStatus | null;
  actor: string;
  control_device_id: string | null;
  ticket_id: string | null;
  execution_nonce: string;
  error_code: string | null;
  created_at: string;
  completed_at: string | null;
};

type DeviceRow = {
  device_id: string;
  display_code: string;
  status: DeviceStatus;
  user_name: string | null;
  user_code: string | null;
};

function text(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validCommandId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function validDeviceId(value: string) {
  return /^[a-f0-9]{64}$/.test(value);
}

async function readCommand(database: D1Database, commandId: string) {
  return database.prepare(
    `SELECT command_id, device_id, operation, expected_status, user_name, user_code,
            state, result_status, actor, control_device_id, ticket_id, execution_nonce,
            error_code, created_at, completed_at
       FROM ru_life_control_commands
      WHERE command_id = ?`,
  ).bind(commandId).first<CommandRow>();
}

function assertSameCommand(
  row: CommandRow,
  input: {
    deviceId: string;
    operation: DeviceCommandOperation;
    expectedStatus: DeviceStatus;
    userName: string | null;
    userCode: string | null;
  },
) {
  if (
    row.device_id !== input.deviceId
    || row.operation !== input.operation
    || row.expected_status !== input.expectedStatus
    || (row.user_name ?? null) !== input.userName
    || (row.user_code ?? null) !== input.userCode
  ) {
    throw new RuLifeAccessError(
      "commandId đã được dùng cho một lệnh Hòa nhập Nga khác.",
      409,
      "COMMAND_ID_CONFLICT",
    );
  }
}

function replay(row: CommandRow) {
  if (row.state === "completed" && row.result_status) {
    return {
      ok: true as const,
      application: "ru-life" as const,
      commandId: row.command_id,
      deviceId: row.device_id,
      status: row.result_status,
      replayed: true,
      completedAt: row.completed_at,
    };
  }
  if (row.state === "uncertain") {
    throw new RuLifeAccessError(
      "Lệnh trước có thể đã áp dụng nhưng chưa hoàn tất side-effect/audit. Cần đối soát registry trước khi tạo lệnh mới.",
      409,
      "COMMAND_RECONCILIATION_REQUIRED",
    );
  }
  if (row.state === "failed") {
    throw new RuLifeAccessError(
      "Lệnh cùng commandId đã thất bại và không được tự động chạy lại.",
      409,
      "COMMAND_PREVIOUSLY_FAILED",
    );
  }
  throw new RuLifeAccessError("Lệnh cùng commandId đang được xử lý.", 409, "COMMAND_IN_PROGRESS");
}

async function updateCommandState(
  database: D1Database,
  commandId: string,
  executionNonce: string,
  state: "completed" | "failed" | "uncertain",
  resultStatus: DeviceStatus | null,
  errorCode: string | null,
) {
  await database.prepare(
    `UPDATE ru_life_control_commands
        SET state = ?, result_status = ?, error_code = ?,
            completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE command_id = ? AND execution_nonce = ? AND state = 'processing'`,
  ).bind(state, resultStatus, errorCode, state, commandId, executionNonce).run();
}

async function auditCommand(
  database: D1Database,
  identity: ControlIdentity,
  action: string,
  deviceId: string,
  detail: Record<string, unknown>,
) {
  await database.prepare(
    "INSERT INTO ru_life_audit_log (actor, action, target, detail_json) VALUES (?, ?, ?, ?)",
  ).bind(
    text(identity.actor, 160) || "system",
    action,
    deviceId,
    JSON.stringify(detail),
  ).run();
}

export async function executeRuLifeDeviceCommand(identity: ControlIdentity, payload: Record<string, unknown>) {
  if (identity.role !== "publisher" && identity.role !== "owner") {
    throw new RuLifeAccessError("Không có quyền thay đổi thiết bị Hòa nhập Nga.", 403, "PUBLISHER_REQUIRED");
  }

  const commandId = text(payload.commandId, 80).toLowerCase();
  const deviceId = text(payload.deviceId, 80).toLowerCase();
  const operation = text(payload.operation, 20) as DeviceCommandOperation;
  const expectedStatus = text(payload.expectedStatus, 20) as DeviceStatus;
  const userName = operation === "approve" ? text(payload.userName, 120) : "";
  const userCode = operation === "approve" ? text(payload.userCode, 80) : "";

  if (!validCommandId(commandId)) throw new RuLifeAccessError("commandId không hợp lệ.", 400, "INVALID_COMMAND_ID");
  if (!validDeviceId(deviceId)) throw new RuLifeAccessError("Mã thiết bị không hợp lệ.", 400, "INVALID_DEVICE");
  if (operation !== "approve" && operation !== "block") {
    throw new RuLifeAccessError("Lệnh thiết bị không được hỗ trợ.", 400, "INVALID_DEVICE_COMMAND");
  }
  if (expectedStatus !== "pending" && expectedStatus !== "approved" && expectedStatus !== "blocked") {
    throw new RuLifeAccessError("expectedStatus không hợp lệ.", 400, "INVALID_EXPECTED_STATUS");
  }
  if (operation === "approve" && expectedStatus !== "pending") {
    throw new RuLifeAccessError("Duyệt chỉ được thực hiện từ trạng thái pending.", 409, "INVALID_APPROVE_TRANSITION");
  }
  if (operation === "approve" && (!userName || !userCode)) {
    throw new RuLifeAccessError("Phải gắn Họ tên và Mã người dùng trước khi cấp quyền.", 400, "USER_BINDING_REQUIRED");
  }
  if (operation === "block" && expectedStatus === "blocked") {
    throw new RuLifeAccessError("Thiết bị đã bị khóa; không tạo lệnh block từ snapshot cũ.", 409, "INVALID_BLOCK_TRANSITION");
  }

  const input = {
    deviceId,
    operation,
    expectedStatus,
    userName: operation === "approve" ? userName : null,
    userCode: operation === "approve" ? userCode : null,
  };
  const database = await getRuLifeDatabase();
  const existing = await readCommand(database, commandId);
  if (existing) {
    assertSameCommand(existing, input);
    return replay(existing);
  }

  const executionNonce = crypto.randomUUID();
  await database.prepare(
    `INSERT OR IGNORE INTO ru_life_control_commands
      (command_id, device_id, operation, expected_status, user_name, user_code,
       state, actor, control_device_id, ticket_id, execution_nonce)
     VALUES (?, ?, ?, ?, ?, ?, 'processing', ?, ?, ?, ?)`,
  ).bind(
    commandId,
    deviceId,
    operation,
    expectedStatus,
    input.userName,
    input.userCode,
    text(identity.actor, 160) || "system",
    identity.controlDeviceId,
    identity.ticketId,
    executionNonce,
  ).run();

  const claimed = await readCommand(database, commandId);
  if (!claimed) throw new RuLifeAccessError("Không thể ghi command ledger.", 500, "COMMAND_LEDGER_WRITE_FAILED");
  assertSameCommand(claimed, input);
  if (claimed.execution_nonce !== executionNonce) return replay(claimed);

  let applied = false;
  let targetStatus: DeviceStatus | null = null;
  try {
    const current = await database.prepare(
      "SELECT device_id, display_code, status, user_name, user_code FROM ru_life_devices WHERE device_id = ?",
    ).bind(deviceId).first<DeviceRow>();
    if (!current) throw new RuLifeAccessError("Không tìm thấy thiết bị Hòa nhập Nga.", 404, "DEVICE_NOT_FOUND");
    if (current.status !== expectedStatus) {
      throw new RuLifeAccessError(
        `Snapshot thiết bị đã thay đổi: expected ${expectedStatus}, hiện tại ${current.status}.`,
        409,
        "DEVICE_STATE_CONFLICT",
      );
    }

    targetStatus = operation === "approve" ? "approved" : "blocked";
    const mutation = operation === "approve"
      ? await database.prepare(
        `UPDATE ru_life_devices
            SET status='approved', user_name=?, user_code=?, approved_at=CURRENT_TIMESTAMP,
                blocked_at=NULL, approved_by=?, updated_at=CURRENT_TIMESTAMP
          WHERE device_id=? AND status=?`,
      ).bind(userName, userCode, identity.actor, deviceId, expectedStatus).run()
      : await database.prepare(
        `UPDATE ru_life_devices
            SET status='blocked', blocked_at=CURRENT_TIMESTAMP, edit_enabled=0, updated_at=CURRENT_TIMESTAMP
          WHERE device_id=? AND status=?`,
      ).bind(deviceId, expectedStatus).run();

    if ((mutation.meta?.changes ?? 0) !== 1) {
      throw new RuLifeAccessError("Thiết bị đã đổi trạng thái trong lúc xử lý lệnh.", 409, "DEVICE_STATE_RACE");
    }
    applied = true;

    if (operation === "block") {
      await database.prepare(
        `UPDATE ru_life_sessions
            SET status='revoked', revoked_at=CURRENT_TIMESTAMP, revoked_by=?, revoke_reason='Thiết bị bị khóa'
          WHERE device_id=? AND status='active'`,
      ).bind(identity.actor, deviceId).run();
    }

    await auditCommand(
      database,
      identity,
      operation === "approve" ? "device_approved_command" : "device_blocked_command",
      deviceId,
      {
        commandId,
        expectedStatus,
        resultStatus: targetStatus,
        deviceCode: current.display_code,
        userName: operation === "approve" ? userName : undefined,
        userCode: operation === "approve" ? userCode : undefined,
        controlDeviceId: identity.controlDeviceId,
        ticketId: identity.ticketId,
      },
    );
    await updateCommandState(database, commandId, executionNonce, "completed", targetStatus, null);

    return {
      ok: true as const,
      application: "ru-life" as const,
      commandId,
      deviceId,
      status: targetStatus,
      replayed: false,
    };
  } catch (error) {
    const errorCode = error instanceof RuLifeAccessError ? error.code : "COMMAND_EXECUTION_FAILED";
    await updateCommandState(
      database,
      commandId,
      executionNonce,
      applied ? "uncertain" : "failed",
      targetStatus,
      errorCode,
    ).catch(() => undefined);
    throw error;
  }
}
