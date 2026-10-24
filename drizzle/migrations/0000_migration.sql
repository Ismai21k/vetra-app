create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  language text not null default 'en',
  location text,
  farm_name text,
  livestock_types text[] not null default '{}',
  farm_size text,
  currency text not null default 'NGN',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'phone')
  on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  kind text not null default 'individual' check (kind in ('individual','group')),
  name text not null,
  species text not null check (species in ('cattle','goat','sheep','poultry','fish','other')),
  breed text,
  sex text,
  birth_date date,
  quantity integer not null default 1 check (quantity >= 0),
  acquired_date date,
  location text,
  notes text,
  status text not null default 'active' check (status in ('active','sold','dead','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  animal_id uuid not null references public.animals(id) on delete restrict,
  type text not null check (type in ('vaccination','treatment','illness','vet_visit')),
  title text not null,
  record_date date not null default current_date,
  next_date date,
  given_by text,
  details text,
  outcome text,
  created_at timestamptz not null default now()
);
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  animal_id uuid references public.animals(id) on delete set null,
  type text not null check (type in ('vaccination','treatment','deworming','checkup','vet_appointment','other')),
  title text not null,
  due_date date not null,
  due_time time,
  notes text,
  status text not null default 'pending' check (status in ('pending','done','missed','cancelled')),
  created_at timestamptz not null default now()
);
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  animal_id uuid references public.animals(id) on delete set null,
  type text not null check (type in ('feeding','cleaning','disinfection','weight_check','breeding','stocking','other')),
  activity_date date not null default current_date,
  notes text,
  done boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  kind text not null check (kind in ('income','expense')),
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  tx_date date not null default current_date,
  description text,
  created_at timestamptz not null default now()
);
create table public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  animal_id uuid references public.animals(id) on delete set null,
  vet_name text not null,
  concern text not null,
  symptoms text,
  preferred_time text,
  contact_method text not null default 'phone',
  status text not null default 'pending' check (status in ('pending','accepted','rescheduled','completed','cancelled')),
  created_at timestamptz not null default now()
);
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  author_name text,
  category text not null default 'general',
  body text not null check (char_length(body) between 1 and 2000),
  likes integer not null default 0,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['animals','health_records','reminders','activities','transactions','consultation_requests'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own select" on public.%I for select to authenticated using (user_id = auth.uid())', t);
    execute format('create policy "own insert" on public.%I for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy "own update" on public.%I for update to authenticated using (user_id = auth.uid())', t);
    execute format('create policy "own delete" on public.%I for delete to authenticated using (user_id = auth.uid())', t);
  end loop;
end $$;

grant select, insert, delete on public.community_posts to authenticated;
grant all on public.community_posts to service_role;
alter table public.community_posts enable row level security;
create policy "read posts" on public.community_posts for select to authenticated using (true);
create policy "create posts" on public.community_posts for insert to authenticated with check (user_id = auth.uid());
create policy "delete own posts" on public.community_posts for delete to authenticated using (user_id = auth.uid());