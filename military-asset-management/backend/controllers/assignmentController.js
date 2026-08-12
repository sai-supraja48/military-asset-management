import db from '../config/db.js';
import { writeAudit } from '../services/auditService.js';

export async function listAssignments(req, res) {
  const baseId = req.scopedBaseId || (req.query.baseId ? Number(req.query.baseId) : null);
  const result = await db.query(
    `SELECT a.*, b.name base_name, e.name equipment_name
     FROM assignments a JOIN bases b ON b.id=a.base_id
     JOIN equipment_types e ON e.id=a.equipment_type_id
     WHERE ($1::int IS NULL OR a.base_id=$1)
     ORDER BY a.assigned_at DESC`,
    [baseId]
  );
  res.json(result.rows);
}

export async function createAssignment(req, res) {
  const { baseId, equipmentTypeId, personnelName, quantity } = req.body;
  const targetBase = req.scopedBaseId || Number(baseId);
  const qty = Number(quantity);

  if (!targetBase || !equipmentTypeId || !personnelName || !Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Valid assignment details are required.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const stock = await client.query(
      `SELECT quantity FROM assets WHERE base_id=$1 AND equipment_type_id=$2 FOR UPDATE`,
      [targetBase, equipmentTypeId]
    );

    if (!stock.rows[0] || stock.rows[0].quantity < qty) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient stock.' });
    }

    const result = await client.query(
      `INSERT INTO assignments
       (base_id,equipment_type_id,personnel_name,quantity,assigned_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [targetBase,equipmentTypeId,personnelName,qty,req.user.userId]
    );

    await client.query(
      `UPDATE assets SET quantity=quantity-$1 WHERE base_id=$2 AND equipment_type_id=$3`,
      [qty,targetBase,equipmentTypeId]
    );

    await writeAudit(req.user.userId,'ASSIGNMENT',
      `Assigned ${qty} units of equipment type ${equipmentTypeId} at base ${targetBase} to ${personnelName}`,client);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({message:e.message});
  } finally {
    client.release();
  }
}
