export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '')
}

export function validateUUID(id) {
  const uuidRegex = 
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function validateUCIMove(move) {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)
}

export function validateWebhookURL(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    if (url.length > 500) return false
    const blocked = [
      'localhost', '127.0.0.1', '0.0.0.0',
      '169.254.', '10.', '192.168.', '172.'
    ]
    if (blocked.some(b => parsed.hostname.includes(b))) 
      return false
    return true
  } catch { return false }
}
