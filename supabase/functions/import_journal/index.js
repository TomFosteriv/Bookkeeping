import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { company_id, csv } = req.body
  if (!company_id || !csv) return res.status(400).json({ error: 'company_id and csv required' })

  const lines = csv.split(/\r?\n/)
  const header = lines.shift().split(',').map(h => h.trim())
  const rows = lines.map(l => l.split(',').map(c => c.trim()))

  // Group rows by Entry number
  const groups = {}
  for (const r of rows) {
    if (r.length === 0 || r.join('') === '') continue
    const obj = {}
    header.forEach((h, i) => obj[h] = r[i])
    const key = obj['Entry number'] || obj['entry number'] || obj['Entry#'] || `${Math.random()}`
    if (!groups[key]) groups[key] = []
    groups[key].push(obj)
  }

  for (const key of Object.keys(groups)) {
    const group = groups[key]
    const first = group[0]
    const { data: je } = await supabase.from('journal_entries').insert({
      company_id,
      date: first['Date'] || null,
      entry_number: key,
      memo: first['Memo'] || null,
      name: first['Name'] || null,
      class: first['Class'] || null,
      source_target_flags: first['Source/target flags'] || null
    }).select().single()

    for (const row of group) {
      // find account by name
      const name = row['Account'] || row['account']
      let { data: acc } = await supabase.from('accounts').select('id').eq('company_id', company_id).eq('name', name).limit(1).single()
      if (!acc) {
        const { data: newAcc } = await supabase.from('accounts').insert({ company_id, name }).select().single()
        acc = newAcc
      }
      await supabase.from('entry_lines').insert({ journal_entry_id: je.id, account_id: acc.id, debit: row['Debit'] || 0, credit: row['Credit'] || 0 })
    }
  }

  res.json({ ok: true })
}
