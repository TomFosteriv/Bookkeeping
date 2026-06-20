-- Supabase migration: create bookkeeping tables

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  type text,
  detail_type text,
  description text,
  balance numeric default 0,
  account_number text,
  parent_id uuid references accounts(id),
  created_at timestamptz default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  date date,
  entry_number text,
  memo text,
  name text,
  class text,
  source_target_flags text,
  created_at timestamptz default now()
);

create table if not exists entry_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid references journal_entries(id) on delete cascade,
  account_id uuid references accounts(id),
  debit numeric default 0,
  credit numeric default 0
);
