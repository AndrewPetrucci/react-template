const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null

const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_API_URL || ''
}

export interface ApiOptions extends RequestInit {
  headers?: HeadersInit
}

export async function api(path: string, options: ApiOptions = {}): Promise<Record<string, unknown>> {
  const token = getToken()
  const base = getBaseUrl()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`

  const res = await fetch(`${base}/api${path}`, { ...options, headers })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) throw new Error((data.error as string) || res.statusText)
  return data
}
