import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { fetchAccountsWithTotals } from '../../../../lib/reportUtils'
import { getPresetRange } from '../../../../lib/datePresets'

export default function TrialBalance() {
  const router = useRouter()
  const { id } = router.query
  const [rows, setRows] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function load(sd = startDate, ed = endDate) {
    if (!id) return
    const data = await fetchAccountsWithTotals(id, sd || null, ed || null)
    setRows(data)
  }

  useEffect(() => {
    if (!id) return
    load()
  }, [id])

  return (
    <div style={{ padding: 20 }}>
      <h1>Trial Balance</h1>
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
      <table>
        <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.account.id}>
              <td>{r.account.name}</td>
              <td>{(r.debit || 0).toFixed(2)}</td>
              <td>{(r.credit || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
