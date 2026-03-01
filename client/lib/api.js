const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_API_URL || ''
}

export async function api(path, options = {}) {
  const token = getToken()
  const base = getBaseUrl()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${base}/api${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}
