import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

const users = [
  ['admin_user', 'AdminPass123!', 'ADMIN', null],
  ['commander_alpha', 'CommandPass123!', 'BASE_COMMANDER', 1],
  ['logistics_officer', 'LogisticsPass123!', 'LOGISTICS_OFFICER', 1]
];

for (const [username, password, role, baseId] of users) {
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO users (username,password_hash,role,base_id)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (username) DO UPDATE SET
       password_hash=EXCLUDED.password_hash,
       role=EXCLUDED.role,
       base_id=EXCLUDED.base_id`,
    [username, hash, role, baseId]
  );
}

console.log('Demo users seeded.');
await db.end();
