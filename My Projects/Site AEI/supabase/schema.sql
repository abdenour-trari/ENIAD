-- supabase/schema.sql
-- Table definitions and trigger functions for Site AEI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'student' check (role in ('student', 'moderator', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index on profiles email
create index if not exists idx_profiles_email on public.profiles(email);

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'student'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  niveau text not null check (niveau in ('CP1', 'CP2', 'CI')),
  pdf_url text,
  category text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index on courses categories & niveau
create index if not exists idx_courses_category on public.courses(category);
create index if not exists idx_courses_niveau on public.courses(niveau);

-- 3. Course Favorites
create table if not exists public.course_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, course_id)
);

-- 4. Housing Posts (Colocation)
create table if not exists public.housing_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null check (price >= 0),
  location text not null,
  rooms_available integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_housing_location on public.housing_posts(location);

-- 5. Marketplace Posts (Vente / Troc)
create table if not exists public.marketplace_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null check (price >= 0),
  image_url text,
  category text not null,
  status text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_marketplace_status on public.marketplace_posts(status);

-- 6. Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  tech_stack text,
  author text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Internships (Stages)
create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  company text not null,
  description text,
  location text,
  duration text,
  contact_email text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Forum Categories
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Forum Posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.forum_categories(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Forum Comments
create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Advertisements (Publicités)
create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  link text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_unread on public.notifications(user_id) where is_read = false;

-- 13. Chat History (Assistant IA)
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  reply text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_text text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Auto-update trigger function for 'updated_at' column
create or replace function public.update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach updated_at triggers to tables
create or replace trigger update_profiles_modtime before update on public.profiles for each row execute procedure public.update_modified_column();
create or replace trigger update_courses_modtime before update on public.courses for each row execute procedure public.update_modified_column();
create or replace trigger update_housing_modtime before update on public.housing_posts for each row execute procedure public.update_modified_column();
create or replace trigger update_marketplace_modtime before update on public.marketplace_posts for each row execute procedure public.update_modified_column();
create or replace trigger update_projects_modtime before update on public.projects for each row execute procedure public.update_modified_column();
create or replace trigger update_internships_modtime before update on public.internships for each row execute procedure public.update_modified_column();
create or replace trigger update_forum_posts_modtime before update on public.forum_posts for each row execute procedure public.update_modified_column();
create or replace trigger update_forum_comments_modtime before update on public.forum_comments for each row execute procedure public.update_modified_column();
create or replace trigger update_advertisements_modtime before update on public.advertisements for each row execute procedure public.update_modified_column();
