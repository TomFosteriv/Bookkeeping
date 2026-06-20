import { supabase } from './supabaseClient'

export async function fetchAccountsWithTotals(company_id, start_date = null, end_date = null) {
  const params = { p_company_id: company_id, p_start_date: start_date, p_end_date: end_date }
  const { data, error } = await supabase.rpc('rpc_account_totals', params)
  if (error) throw error
  if (!data) return []
  return data.map(r => ({ account: { id: r.account_id, name: r.account_name, type: r.account_type }, debit: parseFloat(r.debit || 0), credit: parseFloat(r.credit || 0) }))
}
