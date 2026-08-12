import db from '../config/db.js';

export async function getMetrics(req, res) {
  const { baseId, equipmentTypeId, startDate, endDate } = req.query;
  const scopedBase = req.scopedBaseId || (baseId ? Number(baseId) : null);

  const params = [scopedBase, equipmentTypeId ? Number(equipmentTypeId) : null,
    startDate || null, endDate || null];

  const sql = `
    WITH purchases AS (
      SELECT COALESCE(SUM(quantity),0) total
      FROM purchases
      WHERE ($1::int IS NULL OR base_id = $1)
        AND ($2::int IS NULL OR equipment_type_id = $2)
        AND ($3::timestamp IS NULL OR created_at >= $3)
        AND ($4::timestamp IS NULL OR created_at <= $4)
    ),
    tin AS (
      SELECT COALESCE(SUM(quantity),0) total
      FROM transfers
      WHERE status='COMPLETED'
        AND ($1::int IS NULL OR destination_base_id = $1)
        AND ($2::int IS NULL OR equipment_type_id = $2)
        AND ($3::timestamp IS NULL OR timestamp >= $3)
        AND ($4::timestamp IS NULL OR timestamp <= $4)
    ),
    tout AS (
      SELECT COALESCE(SUM(quantity),0) total
      FROM transfers
      WHERE status='COMPLETED'
        AND ($1::int IS NULL OR source_base_id = $1)
        AND ($2::int IS NULL OR equipment_type_id = $2)
        AND ($3::timestamp IS NULL OR timestamp >= $3)
        AND ($4::timestamp IS NULL OR timestamp <= $4)
    ),
    assigned AS (
      SELECT COALESCE(SUM(quantity),0) total
      FROM assignments
      WHERE ($1::int IS NULL OR base_id = $1)
        AND ($2::int IS NULL OR equipment_type_id = $2)
        AND ($3::timestamp IS NULL OR assigned_at >= $3)
        AND ($4::timestamp IS NULL OR assigned_at <= $4)
    ),
    expended AS (
      SELECT COALESCE(SUM(quantity),0) total
      FROM expenditures
      WHERE ($1::int IS NULL OR base_id = $1)
        AND ($2::int IS NULL OR equipment_type_id = $2)
        AND ($3::timestamp IS NULL OR expended_at >= $3)
        AND ($4::timestamp IS NULL OR expended_at <= $4)
    )
    SELECT
      purchases.total AS purchases,
      tin.total AS "transfersIn",
      tout.total AS "transfersOut",
      assigned.total AS assigned,
      expended.total AS expended,
      (purchases.total + tin.total - tout.total) AS "netMovement",
      (purchases.total + tin.total - tout.total - assigned.total - expended.total) AS "closingBalance"
    FROM purchases, tin, tout, assigned, expended;
  `;

  const result = await db.query(sql, params);
  const row = result.rows[0];

  const netMovement = Number(row.netMovement || 0);
  const assigned = Number(row.assigned || 0);
  const expended = Number(row.expended || 0);
  const closingBalance = Number(row.closingBalance || 0);
  const openingBalance = closingBalance - netMovement + assigned + expended;

  res.json({
    ...row,
    openingBalance,
    netMovement,
    closingBalance
  });
}

export async function getCurrentStock(req, res) {
  const baseId = req.scopedBaseId || (req.query.baseId ? Number(req.query.baseId) : null);
  const params = [baseId, req.query.equipmentTypeId ? Number(req.query.equipmentTypeId) : null];

  const result = await db.query(
    `SELECT a.id, a.base_id, b.name base_name, a.equipment_type_id,
            e.name equipment_name, e.category, a.quantity
     FROM assets a
     JOIN bases b ON b.id=a.base_id
     JOIN equipment_types e ON e.id=a.equipment_type_id
     WHERE ($1::int IS NULL OR a.base_id=$1)
       AND ($2::int IS NULL OR a.equipment_type_id=$2)
     ORDER BY b.name, e.name`,
    params
  );
  res.json(result.rows);
}
