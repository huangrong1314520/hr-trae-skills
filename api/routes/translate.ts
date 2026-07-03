import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/daily', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const translatedToday = db.prepare(
      `SELECT task_id FROM translations
       WHERE user_id = ? AND date(created_at) = ?`
    ).all(req.userId!, today) as any[];

    const translatedIds = translatedToday.map((t: any) => t.task_id);

    let task: any;
    if (translatedIds.length > 0) {
      const placeholders = translatedIds.map(() => '?').join(',');
      task = db.prepare(
        `SELECT * FROM translate_tasks WHERE is_daily = 1 AND id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`
      ).get(...translatedIds);
    } else {
      task = db.prepare(
        'SELECT * FROM translate_tasks WHERE is_daily = 1 ORDER BY RANDOM() LIMIT 1'
      ).get();
    }

    if (!task) {
      res.json({ success: true, data: null, message: '今日翻译任务已完成' });
      return;
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Get daily translate error:', error);
    res.status(500).json({ success: false, error: '获取每日翻译失败' });
  }
});

router.get('/tasks', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang, difficulty } = req.query;
    let sql = 'SELECT * FROM translate_tasks WHERE 1=1';
    const params: any[] = [];

    if (lang) {
      sql += ' AND language = ?';
      params.push(lang);
    }
    if (difficulty) {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }
    sql += ' ORDER BY created_at DESC';

    const tasks = db.prepare(sql).all(...params);
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('List translate tasks error:', error);
    res.status(500).json({ success: false, error: '获取翻译任务失败' });
  }
});

router.get('/tasks/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM translate_tasks WHERE id = ?').get(id) as any;
    if (!task) {
      res.status(404).json({ success: false, error: '任务不存在' });
      return;
    }

    const translations = db.prepare(
      `SELECT t.*, u.username, u.avatar_url
       FROM translations t
       JOIN users u ON t.user_id = u.id
       WHERE t.task_id = ?
       ORDER BY t.likes_count DESC, t.created_at DESC`
    ).all(id);

    res.json({ success: true, data: { ...task, translations } });
  } catch (error) {
    console.error('Get translate task error:', error);
    res.status(500).json({ success: false, error: '获取翻译任务失败' });
  }
});

router.post('/submit', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { taskId, translatedText } = req.body;

    if (!taskId || !translatedText) {
      res.status(400).json({ success: false, error: 'taskId 和 translatedText 不能为空' });
      return;
    }

    const task = db.prepare('SELECT * FROM translate_tasks WHERE id = ?').get(taskId) as any;
    if (!task) {
      res.status(404).json({ success: false, error: '任务不存在' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO translations (user_id, task_id, translated_text) VALUES (?, ?, ?)'
    ).run(req.userId!, taskId, translatedText);

    const translation = db.prepare('SELECT * FROM translations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: translation });
  } catch (error) {
    console.error('Submit translation error:', error);
    res.status(500).json({ success: false, error: '提交翻译失败' });
  }
});

router.get('/community', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.query;
    let sql = `
      SELECT t.*, u.username, u.avatar_url, tt.source_text, tt.language, tt.difficulty
      FROM translations t
      JOIN users u ON t.user_id = u.id
      JOIN translate_tasks tt ON t.task_id = tt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (lang) {
      sql += ' AND tt.language = ?';
      params.push(lang);
    }

    sql += ' ORDER BY t.likes_count DESC, t.created_at DESC LIMIT 50';

    const translations = db.prepare(sql).all(...params);
    res.json({ success: true, data: translations });
  } catch (error) {
    console.error('List community translations error:', error);
    res.status(500).json({ success: false, error: '获取社区翻译失败' });
  }
});

export default router;