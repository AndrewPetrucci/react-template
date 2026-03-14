import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import type { AuthJwtPayload } from '../types/auth.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'

/**
 * Optional auth: if valid Bearer token, set req.user; otherwise req.user is null.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    req.user = null
    next()
    return
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as AuthJwtPayload
    if (payload.sub == null) {
      req.user = null
      next()
      return
    }
    const { rows } = await pool.query(
      'SELECT id, email, email_verified_at, created_at FROM users WHERE id = $1',
      [payload.sub]
    )
    req.user = rows[0] ?? null
  } catch {
    req.user = null
  }
  next()
}

/**
 * Require auth: 401 if no valid token or user not found.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  next()
}
