import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { usersTable, auditLogsTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { RedisClient } from '../../shared/redis.js';

const JWT_SECRET = process.env.JWT_SECRET || 'toolera_shared_jwt_secret_dev_2026_min32chars_xK9!';

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await rdb().select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, cleanEmail)).limit(1).then(r => r[0] ?? null);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const [user] = await db.insert(usersTable).values({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'OWNER',
    }).returning({ id: usersTable.id, email: usersTable.email, name: usersTable.name, role: usersTable.role });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await RedisClient.setAccessToken(user.id, token);

    return res.status(201).json({ success: true, message: 'Account created successfully!', token, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await rdb().select().from(usersTable).where(eq(usersTable.email, cleanEmail)).limit(1);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isBcrypt = user.passwordHash.startsWith('$2');
    const isMatch = isBcrypt
      ? await bcrypt.compare(password.trim(), user.passwordHash)
      : user.passwordHash === password.trim();
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    db.insert(auditLogsTable).values({
      userId: user.id,
      userName: user.name,
      action: 'ADMIN_LOGIN',
      entity: 'User',
      entityId: user.id,
    }).catch(() => {});

    // Store token in Redis — api-gateway reads this to validate sessions
    await RedisClient.setAccessToken(user.id, token);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function adminLogout(req: AuthRequest, res: Response) {
  try {
    if (req.user?.id) {
      await RedisClient.delAccessToken(req.user.id);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAdminProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const rows = await rdb()
      .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name, role: usersTable.role, avatar: usersTable.avatar, createdAt: usersTable.createdAt })
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateAdminProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, email, avatar, password } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name.trim();
    if (email) dataToUpdate.email = email.trim().toLowerCase();
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    if (password && password.trim().length >= 6) dataToUpdate.passwordHash = password.trim();

    const [updated] = await db
      .update(usersTable)
      .set(dataToUpdate)
      .where(eq(usersTable.id, req.user.id))
      .returning({ id: usersTable.id, email: usersTable.email, name: usersTable.name, role: usersTable.role, avatar: usersTable.avatar });

    return res.json({ success: true, message: 'Profile updated successfully', user: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
