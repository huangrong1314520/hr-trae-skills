import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authMiddleware, generateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, username, nativeLanguage, learningLanguages } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ success: false, error: '邮箱、密码和用户名不能为空' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(400).json({ success: false, error: '该邮箱已被注册' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash, native_language) VALUES (?, ?, ?, ?)'
    ).run(username, email, passwordHash, nativeLanguage || 'zh');

    const userId = result.lastInsertRowid as number;

    if (learningLanguages && Array.isArray(learningLanguages)) {
      const insertLang = db.prepare(
        'INSERT OR IGNORE INTO user_languages (user_id, language, level) VALUES (?, ?, ?)'
      );
      for (const lang of learningLanguages) {
        insertLang.run(userId, typeof lang === 'string' ? lang : lang.language, typeof lang === 'string' ? 'beginner' : (lang.level || 'beginner'));
      }
    }

    const user = db.prepare(
      'SELECT id, username, email, avatar_url, native_language, bio, created_at FROM users WHERE id = ?'
    ).get(userId) as any;

    const languages = db.prepare(
      'SELECT language, level FROM user_languages WHERE user_id = ?'
    ).all(userId);

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      data: { token, user: { ...user, languages } },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: '邮箱和密码不能为空' });
      return;
    }

    const user = db.prepare(
      'SELECT id, username, email, password_hash, avatar_url, native_language, bio, created_at FROM users WHERE email = ?'
    ).get(email) as any;

    if (!user) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' });
      return;
    }

    const { password_hash, ...userWithoutPassword } = user;

    const languages = db.prepare(
      'SELECT language, level FROM user_languages WHERE user_id = ?'
    ).all(user.id);

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: { token, user: { ...userWithoutPassword, languages } },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: '登录失败，请稍后重试' });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const user = db.prepare(
      'SELECT id, username, email, avatar_url, native_language, bio, created_at FROM users WHERE id = ?'
    ).get(req.userId!) as any;

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    const languages = db.prepare(
      'SELECT language, level FROM user_languages WHERE user_id = ?'
    ).all(req.userId!);

    res.json({
      success: true,
      data: { ...user, languages },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

export default router;