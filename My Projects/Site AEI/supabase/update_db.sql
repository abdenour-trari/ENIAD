-- supabase/update_db.sql
-- Run this script in the Supabase SQL Editor to update your tables and enable premium features.

-- 1. Alter public.housing_posts to add all missing premium columns
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS quartier text;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS exact_address text;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS roommates_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS surface numeric CHECK (surface >= 0);
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'mixte';
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS wifi boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS parking boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS clim boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS cuisine boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS washing_machine boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS distance_to_campus numeric CHECK (distance_to_campus >= 0);
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS close_to_school boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS charges_included boolean NOT NULL DEFAULT false;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS cover_blur text;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE public.housing_posts ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

-- Ensure check constraints exist for housing_posts
-- Drop the existing constraints first to allow updating non-conforming data without violations
ALTER TABLE public.housing_posts DROP CONSTRAINT IF EXISTS housing_posts_gender_check;
ALTER TABLE public.housing_posts DROP CONSTRAINT IF EXISTS housing_posts_status_check;

-- Normalize any existing non-conforming data
UPDATE public.housing_posts 
SET gender = 'mixte' 
WHERE gender IS NULL OR gender NOT IN ('mixte', 'homme', 'femme');

UPDATE public.housing_posts 
SET status = 'published' 
WHERE status IS NULL OR status NOT IN ('draft', 'published', 'archived', 'deleted');

-- Apply the new check constraints
ALTER TABLE public.housing_posts ADD CONSTRAINT housing_posts_gender_check CHECK (gender in ('mixte', 'homme', 'femme'));
ALTER TABLE public.housing_posts ADD CONSTRAINT housing_posts_status_check CHECK (status in ('draft', 'published', 'archived', 'deleted'));


-- 2. Alter public.marketplace_posts to add missing image_blur column
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS image_blur text;


-- 2b. Enable Supabase Realtime for housing and marketplace tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.housing_posts;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_posts;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;


-- 3. Create missing tables if they don't exist
-- public.housing_images
CREATE TABLE IF NOT EXISTS public.housing_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  image_url text not null,
  image_blur text,
  position integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- public.housing_drafts
CREATE TABLE IF NOT EXISTS public.housing_drafts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_step integer not null default 1,
  draft_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- public.housing_favorites
CREATE TABLE IF NOT EXISTS public.housing_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, post_id)
);

-- public.housing_views
CREATE TABLE IF NOT EXISTS public.housing_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- public.housing_messages
CREATE TABLE IF NOT EXISTS public.housing_messages (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 4. Enable RLS on all tables
ALTER TABLE public.housing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_messages ENABLE ROW LEVEL SECURITY;


-- 5. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read of housing posts" ON public.housing_posts;
DROP POLICY IF EXISTS "Allow owners read all housing posts" ON public.housing_posts;
DROP POLICY IF EXISTS "Allow authenticated users to create housing posts" ON public.housing_posts;
DROP POLICY IF EXISTS "Allow owners to update housing posts" ON public.housing_posts;
DROP POLICY IF EXISTS "Allow owners to delete housing posts" ON public.housing_posts;
DROP POLICY IF EXISTS "Read housing public" ON public.housing_posts;
DROP POLICY IF EXISTS "Insert own housing" ON public.housing_posts;
DROP POLICY IF EXISTS "Update own housing" ON public.housing_posts;
DROP POLICY IF EXISTS "Delete own/admin housing" ON public.housing_posts;

DROP POLICY IF EXISTS "Allow public read of housing images" ON public.housing_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert housing images" ON public.housing_images;
DROP POLICY IF EXISTS "Allow owners to delete housing images" ON public.housing_images;

DROP POLICY IF EXISTS "Allow users to view their own housing draft" ON public.housing_drafts;
DROP POLICY IF EXISTS "Allow users to insert/update their own housing draft" ON public.housing_drafts;
DROP POLICY IF EXISTS "Allow users to update their own housing draft" ON public.housing_drafts;
DROP POLICY IF EXISTS "Allow users to delete their own housing draft" ON public.housing_drafts;

DROP POLICY IF EXISTS "Allow users to view their own favorites" ON public.housing_favorites;
DROP POLICY IF EXISTS "Allow users to add favorites" ON public.housing_favorites;
DROP POLICY IF EXISTS "Allow users to remove favorites" ON public.housing_favorites;

DROP POLICY IF EXISTS "Allow select views count for all" ON public.housing_views;
DROP POLICY IF EXISTS "Allow system/users to log views" ON public.housing_views;

DROP POLICY IF EXISTS "Allow users to read their own messages" ON public.housing_messages;
DROP POLICY IF EXISTS "Allow users to send messages" ON public.housing_messages;


-- 6. Create robust permissive policies

-- Policies for public.housing_posts
CREATE POLICY "Allow public read of housing posts"
  ON public.housing_posts FOR SELECT USING (status = 'published');

CREATE POLICY "Allow owners read all housing posts"
  ON public.housing_posts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create housing posts"
  ON public.housing_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow owners to update housing posts"
  ON public.housing_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owners to delete housing posts"
  ON public.housing_posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.housing_images
CREATE POLICY "Allow public read of housing images"
  ON public.housing_images FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert housing images"
  ON public.housing_images FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.housing_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Allow owners to delete housing images"
  ON public.housing_images FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.housing_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Policies for public.housing_drafts
CREATE POLICY "Allow users to view their own housing draft"
  ON public.housing_drafts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert/update their own housing draft"
  ON public.housing_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own housing draft"
  ON public.housing_drafts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own housing draft"
  ON public.housing_drafts FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.housing_favorites
CREATE POLICY "Allow users to view their own favorites"
  ON public.housing_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to add favorites"
  ON public.housing_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove favorites"
  ON public.housing_favorites FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.housing_views
CREATE POLICY "Allow select views count for all"
  ON public.housing_views FOR SELECT USING (true);

CREATE POLICY "Allow system/users to log views"
  ON public.housing_views FOR INSERT WITH CHECK (true);

-- Policies for public.housing_messages
CREATE POLICY "Allow users to read their own messages"
  ON public.housing_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Allow users to send messages"
  ON public.housing_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- =========================================================================
-- MARKETPLACE PREMIUM DATABASE MIGRATIONS
-- =========================================================================

-- 1. Alter public.marketplace_posts to add premium features columns
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS condition text;
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE public.marketplace_posts ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

-- Drop constraints first to avoid violations during update
ALTER TABLE public.marketplace_posts DROP CONSTRAINT IF EXISTS marketplace_posts_status_check;
ALTER TABLE public.marketplace_posts DROP CONSTRAINT IF EXISTS marketplace_posts_condition_check;

-- Normalize existing marketplace posts to respect new defaults/constraints
UPDATE public.marketplace_posts
SET status = 'published'
WHERE status IS NULL OR status NOT IN ('draft', 'published', 'sold', 'hidden', 'deleted');

UPDATE public.marketplace_posts
SET condition = 'bon'
WHERE condition IS NULL OR condition NOT IN ('neuf', 'très bon', 'bon', 'acceptable');

-- Recreate constraints
ALTER TABLE public.marketplace_posts ADD CONSTRAINT marketplace_posts_status_check CHECK (status in ('draft', 'published', 'sold', 'hidden', 'deleted'));
ALTER TABLE public.marketplace_posts ADD CONSTRAINT marketplace_posts_condition_check CHECK (condition in ('neuf', 'très bon', 'bon', 'acceptable'));


-- 2. Create missing marketplace tables
-- public.marketplace_images
CREATE TABLE IF NOT EXISTS public.marketplace_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.marketplace_posts(id) on delete cascade,
  image_url text not null,
  image_blur text,
  position integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- public.marketplace_drafts
CREATE TABLE IF NOT EXISTS public.marketplace_drafts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_step integer not null default 1,
  draft_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- public.marketplace_favorites
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.marketplace_posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, post_id)
);

-- public.marketplace_views
CREATE TABLE IF NOT EXISTS public.marketplace_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.marketplace_posts(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- public.marketplace_messages
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.marketplace_posts(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. Enable RLS on all marketplace tables
ALTER TABLE public.marketplace_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;


-- 4. Drop existing marketplace policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read of marketplace posts" ON public.marketplace_posts;
DROP POLICY IF EXISTS "Allow owners read all marketplace posts" ON public.marketplace_posts;
DROP POLICY IF EXISTS "Allow authenticated users to create marketplace posts" ON public.marketplace_posts;
DROP POLICY IF EXISTS "Allow owners to update marketplace posts" ON public.marketplace_posts;
DROP POLICY IF EXISTS "Allow owners to delete marketplace posts" ON public.marketplace_posts;

DROP POLICY IF EXISTS "Allow public read of marketplace images" ON public.marketplace_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert marketplace images" ON public.marketplace_images;
DROP POLICY IF EXISTS "Allow owners to delete marketplace images" ON public.marketplace_images;

DROP POLICY IF EXISTS "Allow users to view their own marketplace draft" ON public.marketplace_drafts;
DROP POLICY IF EXISTS "Allow users to insert/update their own marketplace draft" ON public.marketplace_drafts;
DROP POLICY IF EXISTS "Allow users to update their own marketplace draft" ON public.marketplace_drafts;
DROP POLICY IF EXISTS "Allow users to delete their own marketplace draft" ON public.marketplace_drafts;

DROP POLICY IF EXISTS "Allow users to view their own marketplace favorites" ON public.marketplace_favorites;
DROP POLICY IF EXISTS "Allow users to add marketplace favorites" ON public.marketplace_favorites;
DROP POLICY IF EXISTS "Allow users to remove marketplace favorites" ON public.marketplace_favorites;

DROP POLICY IF EXISTS "Allow select marketplace views count for all" ON public.marketplace_views;
DROP POLICY IF EXISTS "Allow system/users to log marketplace views" ON public.marketplace_views;

DROP POLICY IF EXISTS "Allow users to read their own marketplace messages" ON public.marketplace_messages;
DROP POLICY IF EXISTS "Allow users to send marketplace messages" ON public.marketplace_messages;


-- 5. Create new Marketplace policies
-- Policies for public.marketplace_posts
CREATE POLICY "Allow public read of marketplace posts"
  ON public.marketplace_posts FOR SELECT USING (status = 'published');

CREATE POLICY "Allow owners read all marketplace posts"
  ON public.marketplace_posts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create marketplace posts"
  ON public.marketplace_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow owners to update marketplace posts"
  ON public.marketplace_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owners to delete marketplace posts"
  ON public.marketplace_posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.marketplace_images
CREATE POLICY "Allow public read of marketplace images"
  ON public.marketplace_images FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert marketplace images"
  ON public.marketplace_images FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marketplace_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Allow owners to delete marketplace images"
  ON public.marketplace_images FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Policies for public.marketplace_drafts
CREATE POLICY "Allow users to view their own marketplace draft"
  ON public.marketplace_drafts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert/update their own marketplace draft"
  ON public.marketplace_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own marketplace draft"
  ON public.marketplace_drafts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own marketplace draft"
  ON public.marketplace_drafts FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.marketplace_favorites
CREATE POLICY "Allow users to view their own marketplace favorites"
  ON public.marketplace_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to add marketplace favorites"
  ON public.marketplace_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove marketplace favorites"
  ON public.marketplace_favorites FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.marketplace_views
CREATE POLICY "Allow select marketplace views count for all"
  ON public.marketplace_views FOR SELECT USING (true);

CREATE POLICY "Allow system/users to log marketplace views"
  ON public.marketplace_views FOR INSERT WITH CHECK (true);

-- Policies for public.marketplace_messages
CREATE POLICY "Allow users to read their own marketplace messages"
  ON public.marketplace_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Allow users to send marketplace messages"
  ON public.marketplace_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- 6. Enable Realtime for the new marketplace tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_images;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_favorites;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_messages;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

