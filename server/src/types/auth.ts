export interface UserRow {
  id: number
  email: string
  email_verified_at: string | null
  created_at: string | null
}

/** JWT payload shape for our auth tokens (distinct from jsonwebtoken's JwtPayload). */
export interface AuthJwtPayload {
  sub: number
  email?: string
  purpose: 'access' | 'email_verification' | 'password_reset'
}
