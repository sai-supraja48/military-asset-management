import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

function signUser(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, baseId: user.base_id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const result = await db.query(
    `SELECT u.id, u.username, u.password_hash, u.role, u.base_id,
            b.name AS base_name
     FROM users u
     LEFT JOIN bases b ON b.id = u.base_id
     WHERE u.username = $1`,
    [username]
  );

  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signUser(user);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id,
      baseName: user.base_name
    }
  });
}

export async function me(req, res) {
  const result = await db.query(
    `SELECT u.id, u.username, u.role, u.base_id, b.name AS base_name
     FROM users u LEFT JOIN bases b ON b.id = u.base_id
     WHERE u.id = $1`,
    [req.user.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'User not found.' });
  res.json(result.rows[0]);
}

export async function seedDemoUsers(req, res) {
  const users = [
    ['admin_user', 'AdminPass123!', 'ADMIN', null],
    ['commander_alpha', 'CommandPass123!', 'BASE_COMMANDER', 1],
    ['logistics_officer', 'LogisticsPass123!', 'LOGISTICS_OFFICER', 1]
  ];

  for (const [username, password, role, baseId] of users) {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, password_hash, role, base_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         base_id = EXCLUDED.base_id`,
      [username, hash, role, baseId]
    );
  }

  res.json({ message: 'Demo users created/updated.' });
}
