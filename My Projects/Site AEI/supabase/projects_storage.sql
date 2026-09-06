-- supabase/projects_storage.sql
-- Setup Storage Buckets and Policies for the Student GitHub Portfolio Platform

-- 1. Create Buckets
insert into storage.buckets (id, name, public)
values
  ('project-covers', 'project-covers', true),
  ('project-media', 'project-media', true),
  ('project-videos', 'project-videos', true),
  ('project-docs', 'project-docs', true)
on conflict (id) do nothing;

-- 2. Storage Policies for project-covers (Read public, Write authenticated owners)
create policy "Allow public download of project covers"
  on storage.objects for select
  using (bucket_id = 'project-covers');

create policy "Allow authenticated upload of project covers"
  on storage.objects for insert
  with check (bucket_id = 'project-covers' and auth.role() = 'authenticated');

create policy "Allow delete of own project covers"
  on storage.objects for delete
  using (bucket_id = 'project-covers' and auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Storage Policies for project-media (Read public, Write authenticated owners)
create policy "Allow public download of project media"
  on storage.objects for select
  using (bucket_id = 'project-media');

create policy "Allow authenticated upload of project media"
  on storage.objects for insert
  with check (bucket_id = 'project-media' and auth.role() = 'authenticated');

create policy "Allow delete of own project media"
  on storage.objects for delete
  using (bucket_id = 'project-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Storage Policies for project-videos (Read public, Write authenticated owners)
create policy "Allow public download of project videos"
  on storage.objects for select
  using (bucket_id = 'project-videos');

create policy "Allow authenticated upload of project videos"
  on storage.objects for insert
  with check (bucket_id = 'project-videos' and auth.role() = 'authenticated');

create policy "Allow delete of own project videos"
  on storage.objects for delete
  using (bucket_id = 'project-videos' and auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Storage Policies for project-docs (Read public, Write authenticated owners)
create policy "Allow public download of project docs"
  on storage.objects for select
  using (bucket_id = 'project-docs');

create policy "Allow authenticated upload of project docs"
  on storage.objects for insert
  with check (bucket_id = 'project-docs' and auth.role() = 'authenticated');

create policy "Allow delete of own project docs"
  on storage.objects for delete
  using (bucket_id = 'project-docs' and auth.uid()::text = (storage.foldername(name))[1]);
