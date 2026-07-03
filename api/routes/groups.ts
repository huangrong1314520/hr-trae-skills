import { Router, type Response } from 'express';
import db from '../db.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const groups = db.prepare(
      `SELECT g.*, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM groups_table g ORDER BY g.member_count DESC`
    ).all();
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('List groups error:', error);
    res.status(500).json({ success: false, error: '获取小组列表失败' });
  }
});

router.get('/:lang', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.params;
    const group = db.prepare('SELECT * FROM groups_table WHERE language = ?').get(lang) as any;
    if (!group) {
      res.status(404).json({ success: false, error: '小组不存在' });
      return;
    }

    const memberCount = db.prepare(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?'
    ).get(group.id) as any;

    const latestPosts = db.prepare(
      `SELECT p.*, u.username, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.group_id = ?
       ORDER BY p.created_at DESC LIMIT 5`
    ).all(group.id);

    let isMember = false;
    if (req.userId) {
      const member = db.prepare(
        'SELECT id FROM group_members WHERE user_id = ? AND group_id = ?'
      ).get(req.userId, group.id);
      isMember = !!member;
    }

    res.json({
      success: true,
      data: { ...group, member_count: memberCount.count, latest_posts: latestPosts, is_member: isMember },
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, error: '获取小组详情失败' });
  }
});

router.get('/:lang/posts', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const group = db.prepare('SELECT * FROM groups_table WHERE language = ?').get(lang) as any;
    if (!group) {
      res.status(404).json({ success: false, error: '小组不存在' });
      return;
    }

    const posts = db.prepare(
      `SELECT p.*, u.username, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.group_id = ?
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).all(group.id, limit, offset) as any[];

    const totalCount = db.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE group_id = ?'
    ).get(group.id) as any;

    for (const post of posts) {
      const comments = db.prepare(
        `SELECT pc.*, u.username, u.avatar_url
         FROM post_comments pc
         JOIN users u ON pc.user_id = u.id
         WHERE pc.post_id = ?
         ORDER BY pc.created_at ASC`
      ).all(post.id);
      post.comments = comments;
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: { page, limit, total: totalCount.count, totalPages: Math.ceil(totalCount.count / limit) },
      },
    });
  } catch (error) {
    console.error('List group posts error:', error);
    res.status(500).json({ success: false, error: '获取帖子列表失败' });
  }
});

router.post('/:lang/posts', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.params;
    const { content, attachmentUrl, attachmentType } = req.body;

    const group = db.prepare('SELECT * FROM groups_table WHERE language = ?').get(lang) as any;
    if (!group) {
      res.status(404).json({ success: false, error: '小组不存在' });
      return;
    }

    const member = db.prepare(
      'SELECT id FROM group_members WHERE user_id = ? AND group_id = ?'
    ).get(req.userId!, group.id);
    if (!member) {
      res.status(403).json({ success: false, error: '请先加入小组' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO posts (user_id, group_id, content, attachment_url, attachment_type) VALUES (?, ?, ?, ?, ?)'
    ).run(req.userId!, group.id, content || '', attachmentUrl || null, attachmentType || null);

    const post = db.prepare(
      `SELECT p.*, u.username, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: '发帖失败' });
  }
});

router.post('/:lang/join', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.params;
    const group = db.prepare('SELECT * FROM groups_table WHERE language = ?').get(lang) as any;
    if (!group) {
      res.status(404).json({ success: false, error: '小组不存在' });
      return;
    }

    const existing = db.prepare(
      'SELECT id FROM group_members WHERE user_id = ? AND group_id = ?'
    ).get(req.userId!, group.id);

    if (existing) {
      res.json({ success: true, data: { message: '已加入该小组' } });
      return;
    }

    db.prepare(
      'INSERT INTO group_members (user_id, group_id) VALUES (?, ?)'
    ).run(req.userId!, group.id);

    db.prepare(
      'UPDATE groups_table SET member_count = member_count + 1 WHERE id = ?'
    ).run(group.id);

    res.json({ success: true, data: { message: '成功加入小组' } });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, error: '加入小组失败' });
  }
});

router.post('/:lang/checkin', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.params;
    const { message } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const group = db.prepare('SELECT * FROM groups_table WHERE language = ?').get(lang) as any;
    if (!group) {
      res.status(404).json({ success: false, error: '小组不存在' });
      return;
    }

    const existing = db.prepare(
      'SELECT id FROM checkins WHERE user_id = ? AND group_id = ? AND checkin_date = ?'
    ).get(req.userId!, group.id, today);

    if (existing) {
      res.status(400).json({ success: false, error: '今日已打卡' });
      return;
    }

    db.prepare(
      'INSERT INTO checkins (user_id, group_id, message, checkin_date) VALUES (?, ?, ?, ?)'
    ).run(req.userId!, group.id, message || '', today);

    res.json({ success: true, data: { message: '打卡成功' } });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ success: false, error: '打卡失败' });
  }
});

router.get('/:lang/checkins', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { lang } = req.params;
    const { userId } = req.query;

    const group = db.prepare('SELECT * FROM groups_table WHERE language = ?').get(lang) as any;
    if (!group) {
      res.status(404).json({ success: false, error: '小组不存在' });
      return;
    }

    let sql = `
      SELECT c.*, u.username, u.avatar_url
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      WHERE c.group_id = ?
    `;
    const params: any[] = [group.id];

    if (userId) {
      sql += ' AND c.user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY c.checkin_date DESC, c.created_at DESC';

    const checkins = db.prepare(sql).all(...params);
    res.json({ success: true, data: checkins });
  } catch (error) {
    console.error('List checkins error:', error);
    res.status(500).json({ success: false, error: '获取打卡记录失败' });
  }
});

router.post('/posts/:id/like', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' });
      return;
    }

    const newLikes = post.likes_count + 1;
    db.prepare('UPDATE posts SET likes_count = ? WHERE id = ?').run(newLikes, id);

    res.json({ success: true, data: { likes_count: newLikes } });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, error: '点赞失败' });
  }
});

router.post('/posts/:id/comment', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' });
      return;
    }

    if (!content) {
      res.status(400).json({ success: false, error: '评论内容不能为空' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)'
    ).run(id, req.userId!, content);

    const comment = db.prepare(
      `SELECT pc.*, u.username, u.avatar_url
       FROM post_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, error: '评论失败' });
  }
});

export default router;