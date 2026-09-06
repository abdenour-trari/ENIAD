-- supabase/housing_schema.sql
-- Setup advanced tables, RLS, and indexes for the premium Colocation/Housing module

-- 1. Create or extend public.housing_posts
create table if not exists public.housing_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null check (price >= 0),
  location text not null, -- Ville
  quartier text,
  exact_address text,
  rooms_available integer not null default 1,
  roommates_count integer not null default 0,
  surface numeric check (surface >= 0),
  gender text not null default 'mixte' check (gender in ('mixte', 'homme', 'femme')),
  wifi boolean not null default false,
  parking boolean not null default false,
  clim boolean not null default false,
  cuisine boolean not null default false,
  washing_machine boolean not null default false,
  distance_to_campus numeric check (distance_to_campus >= 0),
  close_to_school boolean not null default false,
  charges_included boolean not null default false,
  cover_url text,
  cover_blur text,
  status text not null default 'available' check (status in ('available', 'rented')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add updated_at trigger to housing_posts if not exists
create or replace trigger update_housing_posts_modtime
  before update on public.housing_posts
  for each row execute procedure public.update_modified_column();

-- 2. Create public.housing_images (for secondary gallery photos)
create table if not exists public.housing_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  image_url text not null,
  image_blur text,
  position integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create public.housing_drafts (for debounced autosave state)
create table if not exists public.housing_drafts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_step integer not null default 1,
  draft_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- 4. Create public.housing_favorites
create table if not exists public.housing_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, post_id)
);

-- 5. Create public.housing_views (for tracking analytics)
create table if not exists public.housing_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create public.housing_messages (for direct chat within housing)
create table if not exists public.housing_messages (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.housing_posts(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create optimized Indexes
create index if not exists idx_housing_location_quartier on public.housing_posts(location, quartier);
create index if not exists idx_housing_price on public.housing_posts(price);
create index if not exists idx_housing_images_post on public.housing_images(post_id);
create index if not exists idx_housing_favorites_user on public.housing_favorites(user_id);
create index if not exists idx_housing_messages_participants on public.housing_messages(sender_id, receiver_id);

-- Enable Row Level Security (RLS)
alter table public.housing_posts enable row level security;
alter table public.housing_images enable row level security;
alter table public.housing_drafts enable row level security;
alter table public.housing_favorites enable row level security;
alter table public.housing_views enable row level security;
alter table public.housing_messages enable row level security;

-- 7. Define RLS Policies

-- Policies for public.housing_posts
create policy "Allow public read of housing posts"
  on public.housing_posts for select using (status = 'available');

create policy "Allow owners read all housing posts"
  on public.housing_posts for select using (auth.uid() = user_id);

create policy "Allow authenticated users to create housing posts"
  on public.housing_posts for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Allow owners to update housing posts"
  on public.housing_posts for update using (auth.uid() = user_id);

create policy "Allow owners to delete housing posts"
  on public.housing_posts for delete using (auth.uid() = user_id);

-- Policies for public.housing_images
create policy "Allow public read of housing images"
  on public.housing_images for select using (true);

create policy "Allow authenticated users to insert housing images"
  on public.housing_images for insert with check (
    exists (
      select 1 from public.housing_posts
      where id = post_id and user_id = auth.uid()
    )
  );

create policy "Allow owners to delete housing images"
  on public.housing_images for delete using (
    exists (
      select 1 from public.housing_posts
      where id = post_id and user_id = auth.uid()
    )
  );

-- Policies for public.housing_drafts
create policy "Allow users to view their own housing draft"
  on public.housing_drafts for select using (auth.uid() = user_id);

create policy "Allow users to insert/update their own housing draft"
  on public.housing_drafts for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own housing draft"
  on public.housing_drafts for update using (auth.uid() = user_id);

create policy "Allow users to delete their own housing draft"
  on public.housing_drafts for delete using (auth.uid() = user_id);

-- Policies for public.housing_favorites
create policy "Allow users to view their own favorites"
  on public.housing_favorites for select using (auth.uid() = user_id);

create policy "Allow users to add favorites"
  on public.housing_favorites for insert with check (auth.uid() = user_id);

create policy "Allow users to remove favorites"
  on public.housing_favorites for delete using (auth.uid() = user_id);

-- Policies for public.housing_views
create policy "Allow select views count for all"
  on public.housing_views for select using (true);

create policy "Allow system/users to log views"
  on public.housing_views for insert with check (true);

-- Policies for public.housing_messages
create policy "Allow users to read their own messages"
  on public.housing_messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Allow users to send messages"
  on public.housing_messages for insert with check (auth.uid() = sender_id);
