import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { fetchAccountsWithTotals } from '../../../../lib/reportUtils'
import { getPresetRange } from '../../../../lib/datePresets'

export default function BalanceSheet() {
  const router = useRouter()
  const { id } = router.query
  const [groups, setGroups] = useState({ Assets: [], Liabilities: [], Equity: [] })
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function load(sd = startDate, ed = endDate) {
    if (!id) return
    const rows = await fetchAccountsWithTotals(id, sd || null, ed || null)
    const g = { Assets: [], Liabilities: [], Equity: [] }
    for (const r of rows) {
      const t = (r.account.type || '').toLowerCase()
      const balance = (r.debit || 0) - (r.credit || 0)
      if (t.includes('asset')) g.Assets.push({ name: r.account.name, value: balance })
      else if (t.includes('liability')) g.Liabilities.push({ name: r.account.name, value: balance })
      else if (t.includes('equity') || t.includes('capital')) g.Equity.push({ name: r.account.name, value: balance })
    }
    setGroups(g)
  }

  useEffect(() => {
    if (!id) return
    load()
  }, [id])

  return (
    <div style={{ padding: 20 }}>
      <h1>Balance Sheet</h1>
      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={() => { const r = getPresetRange('this_month'); setStartDate(r.start||''); setEndDate(r.end||''); load(r.start, r.end) }}>This month</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => { const r = getPresetRange('last_month'); setStartDate(r.start||''); setEndDate(r.end||''); load(r.start, r.end) }}>Last month</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => { const r = getPresetRange('ytd'); setStartDate(r.start||''); setEndDate(r.end||''); load(r.start, r.end) }}>YTD</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => { setStartDate(''); setEndDate(''); load(null, null) }}>All</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); load() }} style={{ marginBottom: 12 }}>
        <label>From: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label style={{ marginLeft: 8 }}>To: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button style={{ marginLeft: 8 }} type="submit">Apply</button>
      </form>
      <h2>Assets</h2>
      <ul>{groups.Assets.map(a => <li key={a.name}>{a.name}: {a.value.toFixed(2)}</li>)}</ul>
      <h2>Liabilities</h2>
      <ul>{groups.Liabilities.map(a => <li key={a.name}>{a.name}: {a.value.toFixed(2)}</li>)}</ul>
      <h2>Equity</h2>
      <ul>{groups.Equity.map(a => <li key={a.name}>{a.name}: {a.value.toFixed(2)}</li>)}</ul>
    </div>
  )
}
