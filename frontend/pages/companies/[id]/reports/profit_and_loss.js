import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../../lib/supabaseClient'
import { getPresetRange } from '../../../../lib/datePresets'

export default function ProfitAndLoss() {
  const router = useRouter()
  const { id } = router.query
  const [groups, setGroups] = useState({ Income: [], Expense: [], Other: [] })
  const [incomeTotal, setIncomeTotal] = useState(0)
  const [expenseTotal, setExpenseTotal] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function load(sd = startDate, ed = endDate) {
    if (!id) return
    const params = { p_company_id: id, p_start_date: sd || null, p_end_date: ed || null }
    const { data, error } = await supabase.rpc('rpc_profit_and_loss', params)
    if (error) {
      console.error(error)
      return
    }
    const g = { Income: [], Expense: [], Other: [] }
    let inc = 0, exp = 0
    for (const r of data || []) {
      const cat = r.category || (r.account_type && r.account_type.toLowerCase().includes('income') ? 'Income' : 'Expense')
      const amt = parseFloat(r.amount || 0)
      if (cat === 'Income') { g.Income.push({ name: r.account_name, value: amt }); inc += amt }
      else if (cat === 'Expense') { g.Expense.push({ name: r.account_name, value: amt }); exp += amt }
      else { g.Other.push({ name: r.account_name, value: amt }) }
    }
    setGroups(g)
    setIncomeTotal(inc)
    setExpenseTotal(exp)
  }

  useEffect(() => { if (id) load() }, [id])

  return (
    <div style={{ padding: 20 }}>
      <h1>Profit & Loss</h1>
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

      <h2>Income</h2>
      <ul>
        {groups.Income.map(g => <li key={g.name}>{g.name}: {g.value.toFixed(2)}</li>)}
        <li style={{ marginTop: 8, fontWeight: 'bold' }}>Subtotal Income: {incomeTotal.toFixed(2)}</li>
      </ul>

      <h2>Expenses</h2>
      <ul>
        {groups.Expense.map(g => <li key={g.name}>{g.name}: {g.value.toFixed(2)}</li>)}
        <li style={{ marginTop: 8, fontWeight: 'bold' }}>Subtotal Expenses: {expenseTotal.toFixed(2)}</li>
      </ul>

      {groups.Other && groups.Other.length > 0 && (
        <>
          <h2>Other</h2>
          <ul>
            {groups.Other.map(g => <li key={g.name}>{g.name}: {g.value.toFixed(2)}</li>)}
            <li style={{ marginTop: 8, fontWeight: 'bold' }}>Subtotal Other: {groups.Other.reduce((s, i) => s + (i.value||0), 0).toFixed(2)}</li>
          </ul>
        </>
      )}

      <h3>Net Income: {(incomeTotal - expenseTotal).toFixed(2)}</h3>
    </div>
  )
}
