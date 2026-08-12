import db from '../config/db.js';
import { writeAudit } from '../services/auditService.js';

export async function listTransfers(req, res) {
  const baseId = req.scopedBaseId || (req.query.baseId ? Number(req.query.baseId) : null);
  const result = await db.query(
    `SELECT t.*, sb.name source_base_name, db.name destination_base_name,
            e.name equipment_name, u.username initiated_by_name
     FROM transfers t
     JOIN bases sb ON sb.id=t.source_base_id
     JOIN bases db ON db.id=t.destination_base_id
     JOIN equipment_types e ON e.id=t.equipment_type_id
     LEFT JOIN users u ON u.id=t.initiated_by
     WHERE ($1::int IS NULL OR t.source_base_id=$1 OR t.destination_base_id=$1)
     ORDER BY t.timestamp DESC`,
    [baseId]
  );
  res.json(result.rows);
}

export async function createTransfer(req, res) {
  const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
  const source = req.scopedBaseId || Number(sourceBaseId);
  const destination = Number(destinationBaseId);
  const qty = Number(quantity);

  if (!source || !destination || source === destination || !equipmentTypeId ||
      !Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Invalid transfer details.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const stock = await client.query(
      `SELECT quantity FROM assets
       WHERE base_id=$1 AND equipment_type_id=$2
       FOR UPDATE`,
      [source, equipmentTypeId]
    );

    if (!stock.rows[0] || stock.rows[0].quantity < qty) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient available stock at source base.' });
    }

    const transfer = await client.query(
      `INSERT INTO transfers
       (source_base_id,destination_base_id,equipment_type_id,quantity,status,initiated_by)
       VALUES ($1,$2,$3,$4,'COMPLETED',$5) RETURNING *`,
      [source, destination, equipmentTypeId, qty, req.user.userId]
    );

    await client.query(
      `UPDATE assets SET quantity=quantity-$1
       WHERE base_id=$2 AND equipment_type_id=$3`,
      [qty, source, equipmentTypeId]
    );

    await client.query(
      `INSERT INTO assets (base_id,equipment_type_id,quantity)
       VALUES ($1,$2,$3)
       ON CONFLICT (base_id,equipment_type_id)
       DO UPDATE SET quantity=assets.quantity+EXCLUDED.quantity`,
      [destination, equipmentTypeId, qty]
    );

    await writeAudit(req.user.userId, 'TRANSFER',
      `Transferred ${qty} units of equipment type ${equipmentTypeId} from base ${source} to base ${destination}`, client);

    await client.query('COMMIT');
    res.status(201).json(transfer.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: e.message });
  } finally {
    client.release();
  }
}
