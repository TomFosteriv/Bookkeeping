import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'
import Link from 'next/link'

export default function ImportPage() {
  const router = useRouter()
  const { id } = router.query
  const [company, setCompany] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await supabase.from('companies').select('*').eq('id', id).single()
      setCompany(data)
    }
    load()
  }, [id])

  async function handleFileUpload(e, fnName) {
    e.preventDefault()
    const f = e.target.file.files[0]
    if (!f) return alert('Select a file')
    setStatus('Reading file...')
    const text = await f.text()
    setStatus('Uploading to import function...')
    try {
      const res = await supabase.functions.invoke(fnName, {
        body: JSON.stringify({ company_id: id, csv: text }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.error) {
        console.error(res.error)
        setStatus('Import failed: ' + res.error.message)
      } else {
        setStatus('Import started — refresh reports after a moment')
      }
    } catch (err) {
      console.error(err)
      setStatus('Import error: ' + err.message)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Import for {company ? company.name : '...'}</h1>
      <p><Link href="/companies">Back</Link></p>

      <section style={{ marginBottom: 20 }}>
        <h2>Import Chart of Accounts (CSV)</h2>
        <form onSubmit={e => handleFileUpload(e, 'import_accounts')}>
          <input type="file" name="file" accept=".csv" />
          <button type="submit">Upload Accounts CSV</button>
        </form>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Import Journal Entries (CSV)</h2>
        <form onSubmit={e => handleFileUpload(e, 'import_journal')}>
          <input type="file" name="file" accept=".csv" />
          <button type="submit">Upload Journal CSV</button>
        </form>
      </section>

      <div>
        <strong>Status:</strong> {status}
      </div>
    </div>
  )
}
