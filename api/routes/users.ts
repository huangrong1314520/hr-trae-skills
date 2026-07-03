import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authMiddleware, (req: AuthRequest, res: Response): void => {
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

    const totalCheckins = db.prepare(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ?'
    ).get(req.userId!) as any;

    const totalDubWorks = db.prepare(
      'SELECT COUNT(*) as count FROM dub_works WHERE user_id = ?'
    ).get(req.userId!) as any;

    const totalTranslations = db.prepare(
      'SELECT COUNT(*) as count FROM translations WHERE user_id = ?'
    ).get(req.userId!) as any;

    res.json({
      success: true,
      data: {
        ...user,
        languages,
        stats: {
          totalCheckins: totalCheckins.count,
          totalDubWorks: totalDubWorks.count,
          totalTranslations: totalTranslations.count,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

router.put('/profile', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { bio, avatarUrl } = req.body;

    if (bio !== undefined) {
      db.prepare('UPDATE users SET bio = ?, updated_at = ? WHERE id = ?').run(bio, new Date().toISOString(), req.userId!);
    }
    if (avatarUrl !== undefined) {
      db.prepare('UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?').run(avatarUrl, new Date().toISOString(), req.userId!);
    }

    const user = db.prepare(
      'SELECT id, username, email, avatar_url, native_language, bio, created_at FROM users WHERE id = ?'
    ).get(req.userId!);

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: '更新个人信息失败' });
  }
});

router.put('/languages', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { languages } = req.body;

    if (!languages || !Array.isArray(languages)) {
      res.status(400).json({ success: false, error: 'languages 必须是数组' });
      return;
    }

    db.prepare('DELETE FROM user_languages WHERE user_id = ?').run(req.userId!);

    const insertLang = db.prepare(
      'INSERT INTO user_languages (user_id, language, level) VALUES (?, ?, ?)'
    );
    for (const lang of languages) {
      insertLang.run(req.userId!, typeof lang === 'string' ? lang : lang.language, typeof lang === 'string' ? 'beginner' : (lang.level || 'beginner'));
    }

    const updatedLanguages = db.prepare(
      'SELECT language, level FROM user_languages WHERE user_id = ?'
    ).all(req.userId!);

    res.json({ success: true, data: updatedLanguages });
  } catch (error) {
    console.error('Update languages error:', error);
    res.status(500).json({ success: false, error: '更新学习语言失败' });
  }
});

router.get('/:id/profile', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;

    const user = db.prepare(
      'SELECT id, username, avatar_url, native_language, bio, created_at FROM users WHERE id = ?'
    ).get(id) as any;

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    const languages = db.prepare(
      'SELECT language, level FROM user_languages WHERE user_id = ?'
    ).all(id);

    const totalCheckins = db.prepare(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ?'
    ).get(id) as any;

    const totalDubWorks = db.prepare(
      'SELECT COUNT(*) as count FROM dub_works WHERE user_id = ?'
    ).get(id) as any;

    const totalTranslations = db.prepare(
      'SELECT COUNT(*) as count FROM translations WHERE user_id = ?'
    ).get(id) as any;

    res.json({
      success: true,
      data: {
        ...user,
        languages,
        stats: {
          totalCheckins: totalCheckins.count,
          totalDubWorks: totalDubWorks.count,
          totalTranslations: totalTranslations.count,
        },
      },
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

export default router;