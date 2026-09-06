-- supabase/project_drafts_schema.sql
-- Structure table to save project wizard creation progress

drop table if exists public.project_drafts cascade;

create table public.project_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique, -- unique ensures one active draft per student
  current_step integer not null default 1,
  form_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days') not null
);

create index idx_project_drafts_user on public.project_drafts(user_id);

-- RLS
alter table public.project_drafts enable row level security;

create policy "Select own drafts" on public.project_drafts for select using (auth.uid() = user_id);
create policy "Insert own drafts" on public.project_drafts for insert with check (auth.uid() = user_id);
create policy "Update own drafts" on public.project_drafts for update using (auth.uid() = user_id);
create policy "Delete own drafts" on public.project_drafts for delete using (auth.uid() = user_id);

-- Trigger for auto update modified column if function exists
create or replace trigger update_project_drafts_modtime before update on public.project_drafts for each row execute procedure public.update_modified_column();
