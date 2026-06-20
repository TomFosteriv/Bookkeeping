import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Bookkeeping (Frontend)</h1>
      <ul>
        <li><Link href="/companies">Companies</Link></li>
      </ul>
    </div>
  )
}
