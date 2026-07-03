import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/materials', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang, level, type } = req.query;
    let sql = 'SELECT * FROM dub_materials WHERE 1=1';
    const params: any[] = [];

    if (lang) {
      sql += ' AND language = ?';
      params.push(lang);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    sql += ' ORDER BY id DESC';

    const materials = db.prepare(sql).all(...params);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('List dub materials error:', error);
    res.status(500).json({ success: false, error: '获取配音素材失败' });
  }
});

router.get('/materials/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const material = db.prepare('SELECT * FROM dub_materials WHERE id = ?').get(id) as any;
    if (!material) {
      res.status(404).json({ success: false, error: '素材不存在' });
      return;
    }

    const lines = db.prepare('SELECT * FROM dub_lines WHERE material_id = ? ORDER BY sort_order, line_index').all(id);
    res.json({ success: true, data: { ...material, lines } });
  } catch (error) {
    console.error('Get dub material error:', error);
    res.status(500).json({ success: false, error: '获取素材详情失败' });
  }
});

router.get('/works', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { sort, lang } = req.query;
    let sql = `
      SELECT dw.*, u.username, u.avatar_url, dm.title as material_title, dm.cover_image
      FROM dub_works dw
      JOIN users u ON dw.user_id = u.id
      JOIN dub_materials dm ON dw.material_id = dm.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (lang) {
      sql += ' AND dm.language = ?';
      params.push(lang);
    }

    if (sort === 'popular') {
      sql += ' ORDER BY dw.likes_count DESC, dw.created_at DESC';
    } else {
      sql += ' ORDER BY dw.created_at DESC';
    }

    const works = db.prepare(sql).all(...params);
    res.json({ success: true, data: works });
  } catch (error) {
    console.error('List dub works error:', error);
    res.status(500).json({ success: false, error: '获取配音作品失败' });
  }
});

router.post('/works', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { materialId, overallScore, scores } = req.body;

    if (!materialId) {
      res.status(400).json({ success: false, error: 'materialId 不能为空' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO dub_works (user_id, material_id, overall_score) VALUES (?, ?, ?)'
    ).run(req.userId!, materialId, overallScore ?? null);

    const workId = result.lastInsertRowid as number;

    if (scores && Array.isArray(scores)) {
      const insertScore = db.prepare(
        'INSERT INTO dub_work_scores (dub_work_id, line_index, score) VALUES (?, ?, ?)'
      );
      for (const s of scores) {
        insertScore.run(workId, s.lineIndex, s.score);
      }
    }

    const work = db.prepare('SELECT * FROM dub_works WHERE id = ?').get(workId) as any;
    const workScores = db.prepare('SELECT * FROM dub_work_scores WHERE dub_work_id = ?').all(workId);

    res.status(201).json({ success: true, data: { ...work, scores: workScores } });
  } catch (error) {
    console.error('Create dub work error:', error);
    res.status(500).json({ success: false, error: '创建配音作品失败' });
  }
});

router.post('/works/:id/like', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const work = db.prepare('SELECT * FROM dub_works WHERE id = ?').get(id) as any;
    if (!work) {
      res.status(404).json({ success: false, error: '作品不存在' });
      return;
    }

    const newLikes = work.likes_count + 1;
    db.prepare('UPDATE dub_works SET likes_count = ? WHERE id = ?').run(newLikes, id);

    res.json({ success: true, data: { likes_count: newLikes } });
  } catch (error) {
    console.error('Like dub work error:', error);
    res.status(500).json({ success: false, error: '点赞失败' });
  }
});

router.get('/works/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const work = db.prepare(
      `SELECT dw.*, u.username, u.avatar_url, dm.title as material_title, dm.cover_image
       FROM dub_works dw
       JOIN users u ON dw.user_id = u.id
       JOIN dub_materials dm ON dw.material_id = dm.id
       WHERE dw.id = ?`
    ).get(id) as any;

    if (!work) {
      res.status(404).json({ success: false, error: '作品不存在' });
      return;
    }

    const scores = db.prepare('SELECT * FROM dub_work_scores WHERE dub_work_id = ? ORDER BY line_index').all(id);

    res.json({ success: true, data: { ...work, scores } });
  } catch (error) {
    console.error('Get dub work error:', error);
    res.status(500).json({ success: false, error: '获取配音作品失败' });
  }
});

export default router;