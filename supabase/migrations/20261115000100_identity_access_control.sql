-- DB CARDOSO: identity, organization membership and authorization foundation.
-- Review before applying with Supabase SQL Editor or `supabase db push`.
-- No organization, branch, or commercial sample data is inserted.

begin;

create extension if not exists pgcrypto with schema extensions;

-- Keep authorization helpers outside PostgREST's normally exposed `public` schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

do $$ begin
  create type public.membership_status as enum ('invited', 'active', 'suspended');
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_id_organization_unique unique (id, organization_id),
  constraint branches_name_per_organization_unique unique (organization_id, name)
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_id_organization_unique unique (id, organization_id),
  constraint roles_name_per_organization_unique unique (organization_id, name)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9_.-]*$'),
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null,
  status public.membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_user_per_organization_unique unique (organization_id, user_id),
  constraint memberships_id_organization_unique unique (id, organization_id),
  constraint memberships_role_same_organization_fk
    foreign key (role_id, organization_id) references public.roles(id, organization_id) on delete restrict
);

-- Explicit grants prevent organization membership alone from granting all branches.
create table if not exists public.branch_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  membership_id uuid not null,
  branch_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_memberships_unique unique (membership_id, branch_id),
  constraint branch_memberships_membership_fk
    foreign key (membership_id, organization_id) references public.memberships(id, organization_id) on delete cascade,
  constraint branch_memberships_branch_fk
    foreign key (branch_id, organization_id) references public.branches(id, organization_id) on delete cascade
);

create index if not exists branches_organization_idx on public.branches(organization_id);
create index if not exists roles_organization_idx on public.roles(organization_id);
create index if not exists memberships_user_status_idx on public.memberships(user_id, status);
create index if not exists memberships_organization_idx on public.memberships(organization_id);
create index if not exists memberships_role_idx on public.memberships(role_id);
create index if not exists role_permissions_permission_idx on public.role_permissions(permission_id);
create index if not exists branch_memberships_membership_idx on public.branch_memberships(membership_id, organization_id);
create index if not exists branch_memberships_branch_idx on public.branch_memberships(branch_id, organization_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$ begin
  new.updated_at := pg_catalog.now();
  return new;
end $$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$ begin
  insert into public.profiles (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;
revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

-- Also creates empty profiles for Auth users that existed before this migration.
insert into public.profiles (user_id)
select u.id from auth.users as u
on conflict (user_id) do nothing;

do $$ declare table_name text;
begin
  foreach table_name in array array['organizations','branches','profiles','memberships','roles','permissions','role_permissions','branch_memberships'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

-- SECURITY DEFINER avoids recursive RLS checks. Every referenced object is schema-qualified,
-- and the empty search_path prevents object-shadowing attacks.
create or replace function private.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships as m
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

create or replace function private.has_organization_permission(p_organization_id uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships as m
    join public.role_permissions as rp on rp.role_id = m.role_id
    join public.permissions as p on p.id = rp.permission_id
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and p.code = p_permission
  );
$$;

create or replace function private.can_access_branch(p_branch_id uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.branch_memberships as bm
    join public.memberships as m on m.id = bm.membership_id and m.organization_id = bm.organization_id
    join public.role_permissions as rp on rp.role_id = m.role_id
    join public.permissions as p on p.id = rp.permission_id
    where bm.branch_id = p_branch_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and p.code = p_permission
  );
$$;

revoke all on function private.is_organization_member(uuid) from public, anon, authenticated;
revoke all on function private.has_organization_permission(uuid, text) from public, anon, authenticated;
revoke all on function private.can_access_branch(uuid, text) from public, anon, authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.has_organization_permission(uuid, text) to authenticated;
grant execute on function private.can_access_branch(uuid, text) to authenticated;

alter table public.organizations enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.branch_memberships enable row level security;

revoke all on public.organizations, public.branches, public.profiles, public.memberships,
  public.roles, public.permissions, public.role_permissions, public.branch_memberships from anon, authenticated;
grant select on public.organizations, public.branches, public.profiles, public.memberships,
  public.roles, public.permissions, public.role_permissions, public.branch_memberships to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create policy organizations_read_member on public.organizations
  for select to authenticated using (private.is_organization_member(id));

create policy branches_read_granted_branch on public.branches
  for select to authenticated using (
    private.can_access_branch(id, 'branches.read')
    or private.has_organization_permission(organization_id, 'branches.read_all')
  );

create policy profiles_read_self on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_update_self on public.profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy memberships_read_self_or_manager on public.memberships
  for select to authenticated using (
    user_id = (select auth.uid())
    or private.has_organization_permission(organization_id, 'memberships.read')
  );

create policy roles_read_member on public.roles
  for select to authenticated using (
    private.has_organization_permission(organization_id, 'roles.read')
  );

-- Permission codes are a global, non-secret catalog; clients have read-only access.
create policy permissions_read_authenticated on public.permissions
  for select to authenticated using (true);

create policy role_permissions_read_authorized on public.role_permissions
  for select to authenticated using (
    exists (
      select 1 from public.roles as r
      where r.id = role_id
        and private.has_organization_permission(r.organization_id, 'roles.read')
    )
  );

create policy branch_memberships_read_self_or_manager on public.branch_memberships
  for select to authenticated using (
    exists (
      select 1 from public.memberships as m
      where m.id = membership_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
    or private.has_organization_permission(organization_id, 'memberships.read')
  );

-- No client INSERT/DELETE or role/membership UPDATE policies are present.
-- Provisioning and role changes must use a trusted backend/administrative process.

commit;
