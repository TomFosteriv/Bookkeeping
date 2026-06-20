import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { company_id, csv } = req.body
  if (!company_id || !csv) return res.status(400).json({ error: 'company_id and csv required' })

  // Very simple CSV parsing — for production use a robust parser
  const lines = csv.split(/\r?\n/)
  const header = lines.shift().split(',').map(h => h.trim())
  const rows = lines.map(l => l.split(',').map(c => c.trim()))
  for (const r of rows) {
    if (r.length === 0 || r.join('') === '') continue
    const obj = {}
    header.forEach((h, i) => obj[h] = r[i])
    await supabase.from('accounts').insert({
      company_id,
      name: obj['Account name'] || obj['Name'] || obj['account'] || 'Unknown',
      type: obj['Type'],
      detail_type: obj['Detail type'],
      description: obj['Description'],
      balance: obj['Balance'] || 0,
      account_number: obj['Account number'] || null
    })
  }

  res.json({ ok: true })
}
