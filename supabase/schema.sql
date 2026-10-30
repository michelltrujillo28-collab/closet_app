-- =====================================================================
-- CLOSET VIRTUAL - Esquema completo (Supabase / PostgreSQL)
-- Se puede ejecutar varias veces. Conserva auth.users y profiles,
-- y vuelve a crear las demás tablas.
-- Supabase > SQL Editor > New query > pegar todo > Run
-- =====================================================================

-- ---------- 1) PERFILES (extiende auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- Crear el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ¿El usuario actual es admin? (security definer evita recursión en RLS)
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Rol actual guardado (para impedir que un usuario se haga admin a sí mismo)
create or replace function public.my_role()
returns text language sql security definer set search_path = public stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- 2) TABLAS ----------
drop table if exists public.outfit_plans cascade;
drop table if exists public.outfit_items cascade;
drop table if exists public.outfits cascade;
drop table if exists public.wishlist cascade;
drop table if exists public.garments cascade;
drop table if exists public.categories cascade;

-- Entidad: categorías (las administra el admin)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

-- Entidad: prendas
create table public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  color text,
  size text,
  brand text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Entidad: outfits
create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null,
  occasion text,
  created_at timestamptz not null default now()
);

-- Tabla intermedia: prendas de cada outfit (relación muchos a muchos)
create table public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  primary key (outfit_id, garment_id)
);

-- Entidad: calendario de outfits (un outfit por día y por usuario)
create table public.outfit_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  plan_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, plan_date)
);

-- Entidad: lista de deseos
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null,
  store text,
  price numeric(12,2),
  bought boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.garments (user_id);
create index on public.outfits (user_id);
create index on public.wishlist (user_id);
create index on public.outfit_plans (user_id, plan_date);

-- Categorías iniciales
insert into public.categories (name, sort_order) values
  ('Blusas', 1), ('Pantalones', 2), ('Vestidos', 3), ('Zapatos', 4), ('Chaquetas', 5), ('Complementos', 6);

-- ---------- 3) SEGURIDAD (Row Level Security) ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.outfit_plans enable row level security;

-- profiles
drop policy if exists "ver mi perfil" on public.profiles;
drop policy if exists "admin ve perfiles" on public.profiles;
drop policy if exists "admin edita perfiles" on public.profiles;
drop policy if exists "editar mi perfil" on public.profiles;
create policy "ver mi perfil" on public.profiles for select using (id = auth.uid());
create policy "admin ve perfiles" on public.profiles for select using (public.is_admin());
create policy "editar mi perfil" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "admin edita perfiles" on public.profiles for update using (public.is_admin());

-- categories: todos los usuarios logueados leen; solo admin modifica
create policy "ver categorias" on public.categories for select to authenticated using (true);
create policy "admin crea categorias" on public.categories for insert with check (public.is_admin());
create policy "admin edita categorias" on public.categories for update using (public.is_admin());
create policy "admin borra categorias" on public.categories for delete using (public.is_admin());

-- garments
create policy "ver mis prendas" on public.garments for select using (user_id = auth.uid());
create policy "crear mis prendas" on public.garments for insert with check (user_id = auth.uid());
create policy "editar mis prendas" on public.garments for update using (user_id = auth.uid());
create policy "borrar mis prendas" on public.garments for delete using (user_id = auth.uid());
create policy "admin ve prendas" on public.garments for select using (public.is_admin());
create policy "admin borra prendas" on public.garments for delete using (public.is_admin());

-- outfits
create policy "mis outfits" on public.outfits for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin ve outfits" on public.outfits for select using (public.is_admin());
create policy "admin borra outfits" on public.outfits for delete using (public.is_admin());

-- outfit_items: solo si el outfit es mío
create policy "mis prendas de outfit" on public.outfit_items for all
  using (exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid()))
  with check (exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid()));
create policy "admin ve items de outfits" on public.outfit_items for select using (public.is_admin());

-- outfit_plans
create policy "mi calendario" on public.outfit_plans for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin ve calendarios" on public.outfit_plans for select using (public.is_admin());

-- wishlist
create policy "mi lista de deseos" on public.wishlist for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin ve deseos" on public.wishlist for select using (public.is_admin());
create policy "admin borra deseos" on public.wishlist for delete using (public.is_admin());

-- ---------- 4) FOTOS (Supabase Storage) ----------
-- Bucket público para las fotos de prendas; cada usuario solo sube/borra en su carpeta (id de usuario)
insert into storage.buckets (id, name, public) values ('garments', 'garments', true)
on conflict (id) do update set public = true;

drop policy if exists "ver fotos de prendas" on storage.objects;
drop policy if exists "subir mis fotos" on storage.objects;
drop policy if exists "borrar mis fotos" on storage.objects;
create policy "ver fotos de prendas" on storage.objects for select
  using (bucket_id = 'garments');
create policy "subir mis fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'garments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "borrar mis fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'garments' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 5) Volver admin a un usuario (cambia el correo) ----------
-- update public.profiles set role = 'admin' where email = 'tu_correo@ejemplo.com';
