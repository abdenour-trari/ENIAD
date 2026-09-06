-- supabase/projects_github_schema.sql
-- Comprehensive schema for the AEI student projects (GitHub-like portfolio platform)

-- Drop the old table if it exists to avoid conflicts
drop table if exists public.projects cascade;

-- 1. Projects Table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  slogan text,
  category text not null check (category in ('IA', 'Web', 'Mobile', 'IoT', 'Jeux Video', 'Autre')),
  short_description text,
  full_description text,
  readme_markdown text,
  cover_url text,
  logo_url text,
  github_link text,
  website_link text,
  figma_link text,
  docs_link text,
  youtube_link text,
  status text not null default 'public' check (status in ('draft', 'public', 'private')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_projects_slug on public.projects(slug);
create index idx_projects_category on public.projects(category);
create index idx_projects_status on public.projects(status);

-- 2. Project Versions (Releases)
create table public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version_name text not null, -- e.g. "v1.0.0"
  changelog text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_project_versions_project on public.project_versions(project_id);

-- 3. Project Media (Screenshots & Video Demo references)
create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('screenshot', 'video_demo', 'logo', 'cover')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Project Tags (Technologies used)
create table public.project_tags (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tag text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, tag)
);

create index idx_project_tags_tag on public.project_tags(tag);

-- 5. Project Likes
create table public.project_likes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, user_id)
);

-- 6. Project Bookmarks
create table public.project_bookmarks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, user_id)
);

-- 7. Project Views
create table public.project_views (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_project_views_project on public.project_views(project_id);

-- 8. Project Comments (Threaded)
create table public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.project_comments(id) on delete cascade, -- Self referencing for nested replies
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_project_comments_project on public.project_comments(project_id);

-- 9. Project Collaborators (Team)
create table public.project_collaborators (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'contributor', -- e.g. co-owner, contributor, designer, developer
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, user_id)
);

-- 10. Project Activity (GitHub-like timeline activity)
create table public.project_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null, -- e.g. 'creation', 'push', 'release', 'milestone', 'collaborator_added'
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_project_activity_project on public.project_activity(project_id);

-- Auto-update triggers
create or replace trigger update_projects_modtime before update on public.projects for each row execute procedure public.update_modified_column();
create or replace trigger update_project_comments_modtime before update on public.project_comments for each row execute procedure public.update_modified_column();

-- Automate activity generation trigger function for new projects
create or replace function public.log_project_creation()
returns trigger as $$
begin
  insert into public.project_activity (project_id, user_id, activity_type, description)
  values (new.id, new.user_id, 'creation', 'Le projet a été créé initialement.');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.log_project_creation();

-- Automate activity generation trigger function for new releases
create or replace function public.log_project_release()
returns trigger as $$
declare
  proj_owner uuid;
begin
  select user_id into proj_owner from public.projects where id = new.project_id;
  insert into public.project_activity (project_id, user_id, activity_type, description)
  values (new.project_id, proj_owner, 'release', 'Nouvelle version publiée : ' || new.version_name);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_project_version_added
  after insert on public.project_versions
  for each row execute procedure public.log_project_release();


-- RLS ENABLING
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.project_media enable row level security;
alter table public.project_tags enable row level security;
alter table public.project_likes enable row level security;
alter table public.project_bookmarks enable row level security;
alter table public.project_views enable row level security;
alter table public.project_comments enable row level security;
alter table public.project_collaborators enable row level security;
alter table public.project_activity enable row level security;

-- POLICIES

-- Projects
create policy "Select projects" on public.projects for select using (
  status = 'public' 
  or auth.uid() = user_id 
  or exists (
    select 1 from public.project_collaborators 
    where project_id = id and user_id = auth.uid() and status = 'accepted'
  )
);
create policy "Insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Update own/collab projects" on public.projects for update using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.project_collaborators 
    where project_id = id and user_id = auth.uid() and role = 'co-owner' and status = 'accepted'
  )
);
create policy "Delete own projects" on public.projects for delete using (auth.uid() = user_id);

-- Project sub-tables: public select if project is readable, write allowed if owner/co-owner
create policy "Select project versions" on public.project_versions for select using (
  exists (select 1 from public.projects where id = project_id)
);
create policy "Write project versions" on public.project_versions for all using (
  exists (
    select 1 from public.projects 
    where id = project_id and (user_id = auth.uid() or exists (
      select 1 from public.project_collaborators 
      where project_id = project_versions.project_id and user_id = auth.uid() and role = 'co-owner' and status = 'accepted'
    ))
  )
);

create policy "Select project media" on public.project_media for select using (
  exists (select 1 from public.projects where id = project_id)
);
create policy "Write project media" on public.project_media for all using (
  exists (
    select 1 from public.projects 
    where id = project_id and (user_id = auth.uid() or exists (
      select 1 from public.project_collaborators 
      where project_id = project_media.project_id and user_id = auth.uid() and status = 'accepted'
    ))
  )
);

create policy "Select project tags" on public.project_tags for select using (true);
create policy "Write project tags" on public.project_tags for all using (
  exists (
    select 1 from public.projects 
    where id = project_id and (user_id = auth.uid() or exists (
      select 1 from public.project_collaborators 
      where project_id = project_tags.project_id and user_id = auth.uid() and status = 'accepted'
    ))
  )
);

-- Likes & Bookmarks (Select public, write/delete own)
create policy "Select project likes" on public.project_likes for select using (true);
create policy "Write own likes" on public.project_likes for all using (auth.uid() = user_id);

create policy "Select project bookmarks" on public.project_bookmarks for select using (auth.uid() = user_id);
create policy "Write own bookmarks" on public.project_bookmarks for all using (auth.uid() = user_id);

-- Views (Write public, select owner)
create policy "Select project views" on public.project_views for select using (
  exists (select 1 from public.projects where id = project_id and user_id = auth.uid())
);
create policy "Insert views public" on public.project_views for insert with check (true);

-- Comments (Select public, insert authenticated, edit own)
create policy "Select project comments" on public.project_comments for select using (true);
create policy "Insert comments auth" on public.project_comments for insert with check (auth.uid() = user_id);
create policy "Edit own comments" on public.project_comments for update using (auth.uid() = user_id);
create policy "Delete own/admin comments" on public.project_comments for delete using (
  auth.uid() = user_id 
  or exists (select 1 from public.projects where id = project_id and user_id = auth.uid())
);

-- Collaborators
create policy "Select collaborators" on public.project_collaborators for select using (true);
create policy "Insert collaborator request" on public.project_collaborators for insert with check (auth.uid() = user_id);
create policy "Modify collaborator role/status" on public.project_collaborators for update using (
  exists (select 1 from public.projects where id = project_id and user_id = auth.uid()) 
  or auth.uid() = user_id
);
create policy "Delete collaborator" on public.project_collaborators for delete using (
  exists (select 1 from public.projects where id = project_id and user_id = auth.uid()) 
  or auth.uid() = user_id
);

-- Activity
create policy "Select activity" on public.project_activity for select using (
  exists (select 1 from public.projects where id = project_id)
);
create policy "Insert activity" on public.project_activity for insert with check (
  exists (
    select 1 from public.projects 
    where id = project_id and (user_id = auth.uid() or exists (
      select 1 from public.project_collaborators 
      where project_id = project_activity.project_id and user_id = auth.uid() and status = 'accepted'
    ))
  )
);
