-- Supabase migration: RPC for Profit & Loss

create or replace function public.rpc_profit_and_loss(
  p_company_id uuid,
  p_start_date date default null,
  p_end_date date default null
)
returns table(
  account_id uuid,
  account_name text,
  account_type text,
  category text,
  amount numeric
)
language plpgsql
stable
as $$
begin
  return query
  select a.id, a.name, a.type,
    case
      when lower(coalesce(a.type,'')) like '%income%' or lower(coalesce(a.type,'')) like '%revenue%' then 'Income'
      when lower(coalesce(a.type,'')) like '%expense%' then 'Expense'
      else 'Other'
    end as category,
    coalesce(sum(coalesce(el.credit,0) - coalesce(el.debit,0)), 0)::numeric as amount
  from accounts a
  left join entry_lines el on el.account_id = a.id
  left join journal_entries je on je.id = el.journal_entry_id
    and (p_start_date is null or je.date >= p_start_date)
    and (p_end_date is null or je.date <= p_end_date)
  where a.company_id = p_company_id
  group by a.id, a.name, a.type
  order by category desc, amount desc;
end;
$$;
