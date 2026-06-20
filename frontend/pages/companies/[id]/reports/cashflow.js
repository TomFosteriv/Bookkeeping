import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { fetchAccountsWithTotals } from '../../../../lib/reportUtils'
import { getPresetRange } from '../../../../lib/datePresets'

export default function Cashflow() {
  const router = useRouter()
  const { id } = router.query
  const [cashAccounts, setCashAccounts] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function load(sd = startDate, ed = endDate) {
    if (!id) return
    const rows = await fetchAccountsWithTotals(id, sd || null, ed || null)
    // consider accounts with type containing 'cash' or 'bank'
    const cash = rows.filter(r => {
      const t = (r.account.type || '').toLowerCase()
      return t.includes('cash') || t.includes('bank')
    }).map(r => ({ name: r.account.name, value: (r.debit || 0) - (r.credit || 0) }))
    setCashAccounts(cash)
  }

  useEffect(() => {
    if (!id) return
    load()
  }, [id])

  const net = cashAccounts.reduce((s, a) => s + a.value, 0)

  return (
    <div style={{ padding: 20 }}>
      <h1>Cashflow (simple)</h1>
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
      <ul>{cashAccounts.map(c => <li key={c.name}>{c.name}: {c.value.toFixed(2)}</li>)}</ul>
      <h3>Net Change in Cash: {net.toFixed(2)}</h3>
    </div>
  )
}
