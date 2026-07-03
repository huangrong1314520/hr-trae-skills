import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const badges = db.prepare('SELECT * FROM badges ORDER BY category, id').all() as any[];

    if (req.userId) {
      const userBadges = db.prepare(
        'SELECT badge_id FROM user_badges WHERE user_id = ?'
      ).all(req.userId) as any[];
      const unlockedIds = new Set(userBadges.map((b: any) => b.badge_id));

      for (const badge of badges) {
        badge.unlocked = unlockedIds.has(badge.id);
      }
    }

    res.json({ success: true, data: badges });
  } catch (error) {
    console.error('List badges error:', error);
    res.status(500).json({ success: false, error: '获取徽章列表失败' });
  }
});

router.get('/leaderboard', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const checkinLeaders = db.prepare(
      `SELECT u.id, u.username, u.avatar_url, COUNT(c.id) as count
       FROM users u
       LEFT JOIN checkins c ON u.id = c.user_id
       GROUP BY u.id
       ORDER BY count DESC LIMIT 20`
    ).all();

    const dubLeaders = db.prepare(
      `SELECT u.id, u.username, u.avatar_url, COUNT(dw.id) as count
       FROM users u
       LEFT JOIN dub_works dw ON u.id = dw.user_id
       GROUP BY u.id
       ORDER BY count DESC LIMIT 20`
    ).all();

    const translationLeaders = db.prepare(
      `SELECT u.id, u.username, u.avatar_url, COUNT(t.id) as count
       FROM users u
       LEFT JOIN translations t ON u.id = t.user_id
       GROUP BY u.id
       ORDER BY count DESC LIMIT 20`
    ).all();

    res.json({
      success: true,
      data: {
        checkins: checkinLeaders,
        dubWorks: dubLeaders,
        translations: translationLeaders,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: '获取排行榜失败' });
  }
});

router.get('/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const totalCheckins = db.prepare(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ?'
    ).get(req.userId!) as any;

    const totalDubWorks = db.prepare(
      'SELECT COUNT(*) as count FROM dub_works WHERE user_id = ?'
    ).get(req.userId!) as any;

    const totalTranslations = db.prepare(
      'SELECT COUNT(*) as count FROM translations WHERE user_id = ?'
    ).get(req.userId!) as any;

    const checkinDates = db.prepare(
      `SELECT DISTINCT checkin_date FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC`
    ).all(req.userId!) as any[];

    let streak = 0;
    if (checkinDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const dates = checkinDates.map((d: any) => d.checkin_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (dates[0] === today || dates[0] === yesterdayStr) {
        streak = 1;
        let checkDate = new Date(dates[0]);
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          if (dates[i] === prevDateStr) {
            streak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalCheckins: totalCheckins.count,
        totalDubWorks: totalDubWorks.count,
        totalTranslations: totalTranslations.count,
        streak,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: '获取统计数据失败' });
  }
});

export default router;