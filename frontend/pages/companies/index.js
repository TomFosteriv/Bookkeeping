import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function Companies() {
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error(error)
        return
      }
      setCompanies(data || [])
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Companies</h1>
      <ul>
        {companies.map(c => (
          <li key={c.id}>{c.name} — <Link href={`/companies/${c.id}/import`}>Import</Link> | <Link href={`/companies/${c.id}/reports`}>Reports</Link></li>
        ))}
      </ul>
      <form onSubmit={async e => {
        e.preventDefault()
        const name = e.target.name.value
        const { error } = await supabase.from('companies').insert({ name })
        if (error) {
          alert('Create failed')
          console.error(error)
          return
        }
        e.target.name.value = ''
        // reload list
        const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
        setCompanies(data || [])
      }}>
        <input name="name" placeholder="Company name" />
        <button type="submit">Create</button>
      </form>
    </div>
  )
}
