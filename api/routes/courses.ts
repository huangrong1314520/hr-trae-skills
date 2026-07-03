import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang, level } = req.query;
    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params: any[] = [];

    if (lang) {
      sql += ' AND language = ?';
      params.push(lang);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    sql += ' ORDER BY sort_order, id';

    const courses = db.prepare(sql).all(...params) as any[];

    if (req.userId) {
      for (const course of courses) {
        const units = db.prepare('SELECT id FROM units WHERE course_id = ?').all(course.id) as any[];
        const unitIds = units.map((u: any) => u.id);
        if (unitIds.length > 0) {
          const placeholders = unitIds.map(() => '?').join(',');
          const completed = db.prepare(
            `SELECT COUNT(*) as count FROM learning_progress WHERE user_id = ? AND unit_id IN (${placeholders}) AND completed = 1`
          ).get(req.userId, ...unitIds) as any;
          const total = db.prepare(
            `SELECT COUNT(*) as count FROM unit_items WHERE unit_id IN (${placeholders})`
          ).get(...unitIds) as any;
          course.progress = { completed: completed.count, total: total.count };
        } else {
          course.progress = { completed: 0, total: 0 };
        }
      }
    }

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('List courses error:', error);
    res.status(500).json({ success: false, error: '获取课程列表失败' });
  }
});

router.get('/:courseId/units', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { courseId } = req.params;
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!course) {
      res.status(404).json({ success: false, error: '课程不存在' });
      return;
    }

    const units = db.prepare('SELECT * FROM units WHERE course_id = ? ORDER BY sort_order, id').all(courseId) as any[];

    if (req.userId) {
      for (const unit of units) {
        const completed = db.prepare(
          'SELECT COUNT(*) as count FROM learning_progress WHERE user_id = ? AND unit_id = ? AND completed = 1'
        ).get(req.userId, unit.id) as any;
        const total = db.prepare(
          'SELECT COUNT(*) as count FROM unit_items WHERE unit_id = ?'
        ).get(unit.id) as any;
        unit.progress = { completed: completed.count, total: total.count };
      }
    }

    res.json({ success: true, data: { course, units } });
  } catch (error) {
    console.error('List units error:', error);
    res.status(500).json({ success: false, error: '获取单元列表失败' });
  }
});

router.get('/:courseId/units/:unitId', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { courseId, unitId } = req.params;
    const unit = db.prepare('SELECT * FROM units WHERE id = ? AND course_id = ?').get(unitId, courseId) as any;
    if (!unit) {
      res.status(404).json({ success: false, error: '单元不存在' });
      return;
    }

    const items = db.prepare('SELECT * FROM unit_items WHERE unit_id = ? ORDER BY sort_order, id').all(unitId) as any[];

    if (req.userId) {
      for (const item of items) {
        const progress = db.prepare(
          'SELECT completed, score FROM learning_progress WHERE user_id = ? AND unit_id = ? AND type = ?'
        ).get(req.userId, unitId, item.type) as any;
        item.userProgress = progress || null;
      }
    }

    res.json({ success: true, data: { unit, items } });
  } catch (error) {
    console.error('Get unit error:', error);
    res.status(500).json({ success: false, error: '获取单元详情失败' });
  }
});

router.post('/progress', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { unitId, type, completed, score } = req.body;

    if (!unitId || !type) {
      res.status(400).json({ success: false, error: 'unitId 和 type 不能为空' });
      return;
    }

    const existing = db.prepare(
      'SELECT id FROM learning_progress WHERE user_id = ? AND unit_id = ? AND type = ?'
    ).get(req.userId!, unitId, type) as any;

    if (existing) {
      db.prepare(
        'UPDATE learning_progress SET completed = ?, score = ?, completed_at = ? WHERE id = ?'
      ).run(completed ? 1 : 0, score ?? null, completed ? new Date().toISOString() : null, existing.id);
    } else {
      db.prepare(
        'INSERT INTO learning_progress (user_id, unit_id, type, completed, score, completed_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(req.userId!, unitId, type, completed ? 1 : 0, score ?? null, completed ? new Date().toISOString() : null);
    }

    res.json({ success: true, data: { message: '进度已更新' } });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, error: '更新学习进度失败' });
  }
});

export default router;