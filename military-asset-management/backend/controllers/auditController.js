import db from '../config/db.js';

export async function listAuditLogs(req, res) {
  const result = await db.query(
    `SELECT a.*, u.username FROM audit_logs a
     LEFT JOIN users u ON u.id=a.user_id
     ORDER BY a.created_at DESC LIMIT 200`
  );
  res.json(result.rows);
}
