import db from '../config/db.js';

export async function writeAudit(userId, action, details, client = db) {
  await client.query(
    'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
    [userId, action, details]
  );
}
