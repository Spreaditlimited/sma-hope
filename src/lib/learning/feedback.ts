import 'server-only';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '@/lib/database/pool';
import { SMA_COURSE_SLUG } from './content';
import { requireEnrolment } from './server';
import type { CourseFeedback } from './feedback-input';

export async function learnerFeedback(userId: string) {
  await requireEnrolment(userId);
  const [rows] = await getPool().promise().query<RowDataPacket[]>(
    'SELECT rating,helpful,improvement,updated_at FROM learning_feedback WHERE user_id=? AND course_slug=?',
    [userId, SMA_COURSE_SLUG],
  );
  const row = rows[0];
  return { feedback: row ? { rating: Number(row.rating), helpful: row.helpful as string, improvement: row.improvement as string, updatedAt: new Date(row.updated_at).toISOString() } : null };
}

export async function saveFeedback(userId: string, input: CourseFeedback) {
  await requireEnrolment(userId);
  await getPool().promise().query(
    `INSERT INTO learning_feedback(user_id,course_slug,rating,helpful,improvement) VALUES(?,?,?,?,?)
     ON DUPLICATE KEY UPDATE rating=VALUES(rating),helpful=VALUES(helpful),improvement=VALUES(improvement),updated_at=NOW(3)`,
    [userId, SMA_COURSE_SLUG, input.rating, input.helpful, input.improvement],
  );
  return learnerFeedback(userId);
}

export async function feedbackReport(page: number) {
  const db = getPool().promise();
  const [counts] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) total,AVG(rating) average FROM learning_feedback WHERE course_slug=?', [SMA_COURSE_SLUG],
  );
  const total = Number(counts[0].total), pages = Math.max(1, Math.ceil(total / 20));
  const current = Math.min(page, pages);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT f.rating,f.helpful,f.improvement,f.updated_at,u.name,
     (SELECT COUNT(*) FROM learning_progress p WHERE p.user_id=f.user_id AND p.course_slug=f.course_slug AND p.completed_at IS NOT NULL) completed
     FROM learning_feedback f JOIN account_identity u ON u.id=f.user_id
     WHERE f.course_slug=? ORDER BY f.updated_at DESC,f.user_id LIMIT 20 OFFSET ?`,
    [SMA_COURSE_SLUG, (current - 1) * 20],
  );
  return { total, average: total ? Math.round(Number(counts[0].average) * 10) / 10 : null, page: current, pages,
    responses: rows.map(row => ({ name: row.name as string, rating: Number(row.rating), helpful: row.helpful as string, improvement: row.improvement as string, completed: Number(row.completed), updatedAt: new Date(row.updated_at).toISOString() })) };
}
