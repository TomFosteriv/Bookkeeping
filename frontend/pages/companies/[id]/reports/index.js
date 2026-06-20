import Link from 'next/link'
import { useRouter } from 'next/router'

export default function ReportsIndex() {
  const router = useRouter()
  const { id } = router.query
  return (
    <div style={{ padding: 20 }}>
      <h1>Reports</h1>
      <ul>
        <li><Link href={`/companies/${id}/reports/trial_balance`}>Trial Balance</Link></li>
        <li><Link href={`/companies/${id}/reports/profit_and_loss`}>Profit & Loss</Link></li>
        <li><Link href={`/companies/${id}/reports/balance_sheet`}>Balance Sheet</Link></li>
        <li><Link href={`/companies/${id}/reports/cashflow`}>Cashflow</Link></li>
      </ul>
      <p><Link href={`/companies/${id}/import`}>Back to Import</Link></p>
    </div>
  )
}
