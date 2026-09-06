-- supabase/policies.sql
-- RLS policies for Site AEI

-- 1. Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_favorites enable row level security;
alter table public.housing_posts enable row level security;
alter table public.marketplace_posts enable row level security;
alter table public.projects enable row level security;
alter table public.internships enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.advertisements enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_history enable row level security;
alter table public.events enable row level security;

-- 2. Helper Functions for Role Checking
create or replace function public.has_role(role_name text)
returns boolean as $$
  select coalesce(
    (select role = role_name from public.profiles where id = auth.uid()),
    false
  );
$$ language sql security definer;

-- 3. PROFILES Policies
create policy "Public read profiles" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id or public.has_role('admin'));

-- 4. COURSES Policies (Read by anyone, write by moderator/admin)
create policy "Read courses public" on public.courses
  for select using (true);

create policy "Write courses mod/admin" on public.courses
  for all using (public.has_role('moderator') or public.has_role('admin'));

-- 5. COURSE_FAVORITES Policies (Owned read/write)
create policy "Read own favorites" on public.course_favorites
  for select using (auth.uid() = user_id);

create policy "Insert own favorites" on public.course_favorites
  for insert with check (auth.uid() = user_id);

create policy "Delete own favorites" on public.course_favorites
  for delete using (auth.uid() = user_id);

-- 6. HOUSING_POSTS Policies (Read public, own read/write, admin deletes)
create policy "Read housing public" on public.housing_posts
  for select using (true);

create policy "Insert own housing" on public.housing_posts
  for insert with check (auth.uid() = user_id);

create policy "Update own housing" on public.housing_posts
  for update using (auth.uid() = user_id or public.has_role('admin'));

create policy "Delete own/admin housing" on public.housing_posts
  for delete using (auth.uid() = user_id or public.has_role('admin') or public.has_role('moderator'));

-- 7. MARKETPLACE_POSTS Policies (Read public, own read/write)
create policy "Read marketplace public" on public.marketplace_posts
  for select using (true);

create policy "Insert own marketplace" on public.marketplace_posts
  for insert with check (auth.uid() = user_id);

create policy "Update own marketplace" on public.marketplace_posts
  for update using (auth.uid() = user_id or public.has_role('admin'));

create policy "Delete own/admin marketplace" on public.marketplace_posts
  for delete using (auth.uid() = user_id or public.has_role('admin') or public.has_role('moderator'));

-- 8. PROJECTS Policies (Read public, own read/write)
create policy "Read projects public" on public.projects
  for select using (true);

create policy "Insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Update own projects" on public.projects
  for update using (auth.uid() = user_id or public.has_role('admin'));

create policy "Delete own/admin projects" on public.projects
  for delete using (auth.uid() = user_id or public.has_role('admin'));

-- 9. INTERNSHIPS Policies (Read public, write mod/admin/users)
create policy "Read internships public" on public.internships
  for select using (true);

create policy "Insert internships authenticated" on public.internships
  for insert with check (auth.role() = 'authenticated');

create policy "Update own/mod/admin internships" on public.internships
  for update using (auth.uid() = user_id or public.has_role('moderator') or public.has_role('admin'));

create policy "Delete internships mod/admin" on public.internships
  for delete using (auth.uid() = user_id or public.has_role('moderator') or public.has_role('admin'));

-- 10. FORUM_CATEGORIES Policies (Read public, write admin/moderator)
create policy "Read forum categories public" on public.forum_categories
  for select using (true);

create policy "Write forum categories mod/admin" on public.forum_categories
  for all using (public.has_role('moderator') or public.has_role('admin'));

-- 11. FORUM_POSTS Policies (Read public, insert authenticated, update/delete own/mod/admin)
create policy "Read forum posts public" on public.forum_posts
  for select using (true);

create policy "Insert forum posts authenticated" on public.forum_posts
  for insert with check (auth.uid() = user_id);

create policy "Update own forum posts" on public.forum_posts
  for update using (auth.uid() = user_id or public.has_role('admin'));

create policy "Delete own/mod/admin forum posts" on public.forum_posts
  for delete using (auth.uid() = user_id or public.has_role('moderator') or public.has_role('admin'));

-- 12. FORUM_COMMENTS Policies
create policy "Read forum comments public" on public.forum_comments
  for select using (true);

create policy "Insert forum comments authenticated" on public.forum_comments
  for insert with check (auth.uid() = user_id);

create policy "Update own forum comments" on public.forum_comments
  for update using (auth.uid() = user_id or public.has_role('admin'));

create policy "Delete own/mod/admin forum comments" on public.forum_comments
  for delete using (auth.uid() = user_id or public.has_role('moderator') or public.has_role('admin'));

-- 13. ADVERTISEMENTS Policies (Read public, write admin)
create policy "Read advertisements public" on public.advertisements
  for select using (status = 'active');

create policy "Write advertisements admin" on public.advertisements
  for all using (public.has_role('admin'));

-- 14. NOTIFICATIONS Policies (Own read/write, system creates)
create policy "Read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- 15. CHAT_HISTORY Policies (Own read/write)
create policy "Read own chat history" on public.chat_history
  for select using (auth.uid() = user_id);

create policy "Insert own chat history" on public.chat_history
  for insert with check (auth.uid() = user_id);

create policy "Delete own chat history" on public.chat_history
  for delete using (auth.uid() = user_id);

-- 16. EVENTS Policies (Read public, write mod/admin)
create policy "Read events public" on public.events
  for select using (true);

create policy "Write events mod/admin" on public.events
  for all using (public.has_role('moderator') or public.has_role('admin'));
