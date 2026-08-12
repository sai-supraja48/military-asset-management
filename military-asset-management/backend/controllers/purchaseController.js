import db from '../config/db.js';
import { writeAudit } from '../services/auditService.js';

export async function listPurchases(req, res) {
  const baseId = req.scopedBaseId || (req.query.baseId ? Number(req.query.baseId) : null);
  const result = await db.query(
    `SELECT p.*, b.name base_name, e.name equipment_name, u.username created_by_name
     FROM purchases p
     JOIN bases b ON b.id=p.base_id
     JOIN equipment_types e ON e.id=p.equipment_type_id
     LEFT JOIN users u ON u.id=p.created_by
     WHERE ($1::int IS NULL OR p.base_id=$1)
     ORDER BY p.created_at DESC`,
    [baseId]
  );
  res.json(result.rows);
}

export async function createPurchase(req, res) {
  const { baseId, equipmentTypeId, quantity } = req.body;
  const targetBase = req.scopedBaseId || Number(baseId);

  if (!targetBase || !equipmentTypeId || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Valid base, equipment type and positive quantity are required.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const purchase = await client.query(
      `INSERT INTO purchases (base_id, equipment_type_id, quantity, created_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [targetBase, equipmentTypeId, quantity, req.user.userId]
    );

    await client.query(
      `INSERT INTO assets (base_id, equipment_type_id, quantity)
       VALUES ($1,$2,$3)
       ON CONFLICT (base_id,equipment_type_id)
       DO UPDATE SET quantity = assets.quantity + EXCLUDED.quantity`,
      [targetBase, equipmentTypeId, quantity]
    );

    await writeAudit(req.user.userId, 'PURCHASE',
      `Added ${quantity} units of equipment type ${equipmentTypeId} to base ${targetBase}`, client);

    await client.query('COMMIT');
    res.status(201).json(purchase.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: e.message });
  } finally {
    client.release();
  }
}
