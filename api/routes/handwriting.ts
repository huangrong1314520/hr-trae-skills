import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/chars', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.query;
    const language = lang || 'ja';

    const chars = db.prepare(
      `SELECT DISTINCT character_text FROM handwriting_works
       WHERE language = ? AND character_text IS NOT NULL
       ORDER BY id DESC LIMIT 100`
    ).all(language);

    const charList = chars.map((c: any) => c.character_text);
    res.json({ success: true, data: charList });
  } catch (error) {
    console.error('List chars error:', error);
    res.status(500).json({ success: false, error: '获取字符列表失败' });
  }
});

router.post('/works', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { language, characterText, imageUrl } = req.body;

    if (!language || !characterText) {
      res.status(400).json({ success: false, error: 'language 和 characterText 不能为空' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO handwriting_works (user_id, language, character_text, image_url) VALUES (?, ?, ?, ?)'
    ).run(req.userId!, language, characterText, imageUrl || null);

    const work = db.prepare(
      `SELECT hw.*, u.username, u.avatar_url
       FROM handwriting_works hw
       JOIN users u ON hw.user_id = u.id
       WHERE hw.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: work });
  } catch (error) {
    console.error('Create handwriting work error:', error);
    res.status(500).json({ success: false, error: '创建手写作品失败' });
  }
});

router.get('/works', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.query;
    let sql = `
      SELECT hw.*, u.username, u.avatar_url
      FROM handwriting_works hw
      JOIN users u ON hw.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (lang) {
      sql += ' AND hw.language = ?';
      params.push(lang);
    }

    sql += ' ORDER BY hw.created_at DESC';

    const works = db.prepare(sql).all(...params);
    res.json({ success: true, data: works });
  } catch (error) {
    console.error('List handwriting works error:', error);
    res.status(500).json({ success: false, error: '获取手写作品失败' });
  }
});

router.post('/works/:id/like', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const work = db.prepare('SELECT * FROM handwriting_works WHERE id = ?').get(id) as any;
    if (!work) {
      res.status(404).json({ success: false, error: '作品不存在' });
      return;
    }

    const newLikes = work.likes_count + 1;
    db.prepare('UPDATE handwriting_works SET likes_count = ? WHERE id = ?').run(newLikes, id);

    res.json({ success: true, data: { likes_count: newLikes } });
  } catch (error) {
    console.error('Like handwriting work error:', error);
    res.status(500).json({ success: false, error: '点赞失败' });
  }
});

export default router;