-- ════════════════════════════════════════════════════════════
--  SaathPay — Database Schema
--  Run this in Supabase SQL Editor: https://app.supabase.com
--  (Your Project → SQL Editor → New Query → paste → Run)
-- ════════════════════════════════════════════════════════════

-- ─────────────── ENUMS ───────────────
do $$ begin
  create type user_role as enum ('freelancer', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum (
    'draft', 'awaiting_payment', 'funded', 'in_progress', 'completed', 'disputed', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type milestone_status as enum (
    'pending', 'submitted', 'approved', 'paid', 'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum (
    'escrow_fund', 'milestone_payout', 'agent_payout', 'refund'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'escrow_funded', 'milestone_submitted', 'milestone_approved',
    'payment_released', 'agent_paid', 'dispute_opened', 'project_completed'
  );
exception when duplicate_object then null; end $$;

-- ─────────────── USERS ───────────────
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role user_role not null default 'freelancer',
  wallet_address text unique,
  avatar_url text,
  reputation_score integer default 50,
  total_earned numeric(20,6) default 0,
  total_projects_completed integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─────────────── PROJECTS ───────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.users(id) on delete cascade,
  client_email text not null,
  client_name text,
  title text not null,
  description text,
  total_amount numeric(20,6) not null,
  currency text default 'USD',
  status project_status default 'draft',
  escrow_pda text,
  solana_tx_hash text,
  dodo_checkout_url text,
  dodo_payment_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

create index if not exists idx_projects_freelancer on public.projects(freelancer_id);
create index if not exists idx_projects_status on public.projects(status);

-- ─────────────── MILESTONES ───────────────
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  index integer not null,
  title text not null,
  deliverable text,
  amount numeric(20,6) not null,
  deadline date,
  proof_uri text,
  status milestone_status default 'pending',
  ai_generated boolean default false,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  paid_at timestamp with time zone,
  solana_tx_hash text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_milestones_project on public.milestones(project_id);
create index if not exists idx_milestones_status on public.milestones(status);

-- ─────────────── TRANSACTIONS ───────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  agent_id uuid,
  type transaction_type not null,
  amount numeric(20,6) not null,
  currency text default 'USDC',
  from_address text,
  to_address text,
  solana_tx_hash text,
  dodo_payment_id text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_transactions_project on public.transactions(project_id);

-- ─────────────── AI AGENTS ───────────────
create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  role text,
  wallet_address text not null,
  encrypted_key text,
  rate_per_task numeric(20,6),
  total_paid numeric(20,6) default 0,
  tasks_completed integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create index if not exists idx_agents_project on public.ai_agents(project_id);

-- ─────────────── NOTIFICATIONS ───────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(user_id, read);

-- ════════════════════════════════════════════════════════════
--  RLS (Row Level Security)
-- ════════════════════════════════════════════════════════════

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.transactions enable row level security;
alter table public.ai_agents enable row level security;
alter table public.notifications enable row level security;

-- Users: anyone can read (public profiles), only owner can update
drop policy if exists "Users viewable by all" on public.users;
create policy "Users viewable by all"
  on public.users for select using (true);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Projects: freelancer owns; client access by email (future)
drop policy if exists "Projects viewable by owner" on public.projects;
create policy "Projects viewable by owner"
  on public.projects for select using (freelancer_id = auth.uid());

drop policy if exists "Freelancer creates projects" on public.projects;
create policy "Freelancer creates projects"
  on public.projects for insert with check (freelancer_id = auth.uid());

drop policy if exists "Freelancer updates own projects" on public.projects;
create policy "Freelancer updates own projects"
  on public.projects for update using (freelancer_id = auth.uid());

-- Milestones: scoped via project
drop policy if exists "Milestones viewable by project owner" on public.milestones;
create policy "Milestones viewable by project owner"
  on public.milestones for select using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id and p.freelancer_id = auth.uid()
    )
  );

drop policy if exists "Milestones manageable by project owner" on public.milestones;
create policy "Milestones manageable by project owner"
  on public.milestones for all using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id and p.freelancer_id = auth.uid()
    )
  );

-- Transactions: read via project
drop policy if exists "Transactions viewable by project owner" on public.transactions;
create policy "Transactions viewable by project owner"
  on public.transactions for select using (
    exists (
      select 1 from public.projects p
      where p.id = transactions.project_id and p.freelancer_id = auth.uid()
    )
  );

-- Agents: via project
drop policy if exists "Agents viewable by project owner" on public.ai_agents;
create policy "Agents viewable by project owner"
  on public.ai_agents for select using (
    exists (
      select 1 from public.projects p
      where p.id = ai_agents.project_id and p.freelancer_id = auth.uid()
    )
  );

drop policy if exists "Agents manageable by project owner" on public.ai_agents;
create policy "Agents manageable by project owner"
  on public.ai_agents for all using (
    exists (
      select 1 from public.projects p
      where p.id = ai_agents.project_id and p.freelancer_id = auth.uid()
    )
  );

-- Notifications: own only
drop policy if exists "Own notifications only" on public.notifications;
create policy "Own notifications only"
  on public.notifications for select using (user_id = auth.uid());

drop policy if exists "Own notifications mark read" on public.notifications;
create policy "Own notifications mark read"
  on public.notifications for update using (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════
--  TRIGGERS
-- ════════════════════════════════════════════════════════════

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'freelancer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at bump
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
  for each row execute procedure public.touch_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute procedure public.touch_updated_at();

-- ════════════════════════════════════════════════════════════
--  DONE!  Verify with:
--   select count(*) from public.users;
-- ════════════════════════════════════════════════════════════
