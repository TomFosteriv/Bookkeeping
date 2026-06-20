function fmt(d) {
  return d.toISOString().slice(0, 10)
}

export function getPresetRange(key) {
  const now = new Date()
  if (key === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start: fmt(start), end: fmt(end) }
  }
  if (key === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return { start: fmt(start), end: fmt(end) }
  }
  if (key === 'ytd') {
    const start = new Date(now.getFullYear(), 0, 1)
    const end = now
    return { start: fmt(start), end: fmt(end) }
  }
  // all
  return { start: null, end: null }
}
