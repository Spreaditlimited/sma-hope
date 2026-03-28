create extension if not exists pgcrypto;

create table if not exists public.donor_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_account_id uuid references public.donor_accounts(id) on delete set null,
  email text not null,
  paystack_reference text not null unique,
  amount_major numeric(12, 2) not null,
  currency text not null,
  donation_interval text not null default 'one_time',
  status text not null,
  plan_code text,
  subscription_code text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  donor_account_id uuid references public.donor_accounts(id) on delete set null,
  email text not null,
  subscription_code text not null unique,
  customer_code text,
  plan_code text,
  email_token text,
  status text not null,
  next_payment_date timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_orders (
  id uuid primary key default gen_random_uuid(),
  donor_account_id uuid references public.donor_accounts(id) on delete set null,
  email text not null,
  paystack_reference text not null unique,
  status text not null,
  total_ngn numeric(12, 2) not null,
  quantity integer not null default 1,
  delivery_area text,
  phone text,
  address text,
  city text,
  state text,
  note text,
  fez_tracking_id text,
  fez_tracking_url text,
  fez_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  role text not null check (role in ('admin', 'ops')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists donor_accounts_set_updated_at on public.donor_accounts;
create trigger donor_accounts_set_updated_at
before update on public.donor_accounts
for each row execute procedure public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

drop trigger if exists book_orders_set_updated_at on public.book_orders;
create trigger book_orders_set_updated_at
before update on public.book_orders
for each row execute procedure public.set_updated_at();

alter table public.donor_accounts enable row level security;
alter table public.donations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.book_orders enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists donor_accounts_select_own on public.donor_accounts;
create policy donor_accounts_select_own
on public.donor_accounts
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists donor_accounts_update_own on public.donor_accounts;
create policy donor_accounts_update_own
on public.donor_accounts
for update
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists donations_select_own on public.donations;
create policy donations_select_own
on public.donations
for select
to authenticated
using (
  donor_account_id in (
    select id from public.donor_accounts where auth_user_id = auth.uid()
  )
);

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using (
  donor_account_id in (
    select id from public.donor_accounts where auth_user_id = auth.uid()
  )
);

drop policy if exists book_orders_select_own on public.book_orders;
create policy book_orders_select_own
on public.book_orders
for select
to authenticated
using (
  donor_account_id in (
    select id from public.donor_accounts where auth_user_id = auth.uid()
  )
);

drop policy if exists admin_users_select_own on public.admin_users;
create policy admin_users_select_own
on public.admin_users
for select
to authenticated
using (
  auth.uid() = auth_user_id
  or lower(email) = lower(auth.jwt() ->> 'email')
);
