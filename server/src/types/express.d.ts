import type { UserRow } from './auth'

declare global {
  namespace Express {
    interface Request {
      user?: UserRow | null
    }
  }
}

export {}
