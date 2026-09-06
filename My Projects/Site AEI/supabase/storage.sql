-- supabase/storage.sql
-- Setup Storage Buckets and Policies for Site AEI

-- 1. Create Buckets
insert into storage.buckets (id, name, public)
values
  ('courses-pdf', 'courses-pdf', true),
  ('housing-images', 'housing-images', true),
  ('marketplace-images', 'marketplace-images', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Storage Policies for Courses-PDF (Read for all, write for admin/mod)
create policy "Allow public download of courses"
  on storage.objects for select
  using (bucket_id = 'courses-pdf');

create policy "Allow mod/admin to upload courses"
  on storage.objects for insert
  with check (bucket_id = 'courses-pdf' and (
    select coalesce(role in ('admin', 'moderator'), false)
    from public.profiles
    where id = auth.uid()
  ));

create policy "Allow mod/admin to delete courses"
  on storage.objects for delete
  using (bucket_id = 'courses-pdf' and (
    select coalesce(role in ('admin', 'moderator'), false)
    from public.profiles
    where id = auth.uid()
  ));

-- 3. Storage Policies for Housing-Images (Read for all, insert by authenticated, delete by owner)
create policy "Allow public view of housing images"
  on storage.objects for select
  using (bucket_id = 'housing-images');

create policy "Allow authenticated upload of housing images"
  on storage.objects for insert
  with check (bucket_id = 'housing-images' and auth.role() = 'authenticated');

create policy "Allow delete of own housing images"
  on storage.objects for delete
  using (bucket_id = 'housing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Storage Policies for Marketplace-Images (Read for all, insert by authenticated, delete by owner)
create policy "Allow public view of marketplace images"
  on storage.objects for select
  using (bucket_id = 'marketplace-images');

create policy "Allow authenticated upload of marketplace images"
  on storage.objects for insert
  with check (bucket_id = 'marketplace-images' and auth.role() = 'authenticated');

create policy "Allow delete of own marketplace images"
  on storage.objects for delete
  using (bucket_id = 'marketplace-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Storage Policies for Avatars (Read for all, insert/update by owner)
create policy "Allow public view of avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Allow owner to upload/update avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Allow owner to delete avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
