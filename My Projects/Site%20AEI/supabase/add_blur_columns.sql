-- supabase/add_blur_columns.sql
-- Add image_url and image_blur to housing_posts (since it lacked image URLs)
-- Add image_blur to marketplace_posts

-- 1. Modify housing_posts
alter table public.housing_posts
add column if not exists image_url text,
add column if not exists image_blur text;

-- 2. Modify marketplace_posts
alter table public.marketplace_posts
add column if not exists image_blur text;
