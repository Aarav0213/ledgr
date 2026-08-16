create table if not exists public.dashboard_alert_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_key text not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, alert_key)
);

create index if not exists dashboard_alert_dismissals_user_id_idx
  on public.dashboard_alert_dismissals (user_id);

create index if not exists dashboard_alert_dismissals_dismissed_at_idx
  on public.dashboard_alert_dismissals (dismissed_at desc);

alter table public.dashboard_alert_dismissals enable row level security;

drop policy if exists "Users can read their own alert dismissals" on public.dashboard_alert_dismissals;
create policy "Users can read their own alert dismissals"
  on public.dashboard_alert_dismissals
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own alert dismissals" on public.dashboard_alert_dismissals;
create policy "Users can insert their own alert dismissals"
  on public.dashboard_alert_dismissals
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own alert dismissals" on public.dashboard_alert_dismissals;
create policy "Users can update their own alert dismissals"
  on public.dashboard_alert_dismissals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own alert dismissals" on public.dashboard_alert_dismissals;
create policy "Users can delete their own alert dismissals"
  on public.dashboard_alert_dismissals
  for delete
  using (auth.uid() = user_id);
