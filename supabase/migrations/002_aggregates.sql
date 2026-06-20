-- Supabase migration: server-side aggregation RPCs

create or replace function public.rpc_account_totals(
  p_company_id uuid,
  p_start_date date default null,
  p_end_date date default null
)
returns table(
  account_id uuid,
  account_name text,
  account_type text,
  debit numeric,
  credit numeric
)
language plpgsql
stable
as $$
begin
  return query
  select a.id, a.name, a.type,
    coalesce(sum(el.debit), 0)::numeric,
    coalesce(sum(el.credit), 0)::numeric
  from accounts a
  left join entry_lines el on el.account_id = a.id
  left join journal_entries je on je.id = el.journal_entry_id
    and (p_start_date is null or je.date >= p_start_date)
    and (p_end_date is null or je.date <= p_end_date)
  where a.company_id = p_company_id
  group by a.id, a.name, a.type
  order by a.name;
end;
$$;
