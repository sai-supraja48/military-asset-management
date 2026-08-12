import db from '../config/db.js';

export async function getBases(req, res) {
  const result = await db.query('SELECT * FROM bases ORDER BY id');
  res.json(result.rows);
}

export async function getEquipmentTypes(req, res) {
  const result = await db.query('SELECT * FROM equipment_types ORDER BY category, name');
  res.json(result.rows);
}
