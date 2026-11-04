-- =====================================================================
-- အလုပ်သမားစာရင်း (Worker Name List) – Cloud Sync setup
-- Supabase Dashboard → SQL Editor → New query → ဒီစာအားလုံး paste → Run
-- (တစ်ခါပဲ Run ရပါမယ်။ ထပ် Run လည်း ပျက်စီးမှု မရှိပါ)
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- One row per team (team = sha256 of the team code; the code itself is never stored)
create table if not exists public.wnl_teams (
  team        text primary key,
  roster      jsonb not null default '{}'::jsonb,
  roster_at   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- One row per worker per day. rec = null means "deleted"
create table if not exists public.wnl_att (
  team        text not null references public.wnl_teams(team) on delete cascade,
  d           text not null,
  wid         text not null,
  rec         jsonb,
  updated_at  timestamptz not null default now(),
  primary key (team, d, wid)
);
create index if not exists wnl_att_team_updated on public.wnl_att (team, updated_at);

-- Lock the tables: no direct access with the publishable key.
-- All access goes through the functions below, which require the team code.
alter table public.wnl_teams enable row level security;
alter table public.wnl_att   enable row level security;
revoke all on public.wnl_teams from anon, authenticated;
revoke all on public.wnl_att   from anon, authenticated;

create or replace function public.wnl_team_id(p_code text)
returns text language plpgsql immutable
set search_path = public, extensions as $$
begin
  if p_code is null or length(p_code) < 6 then
    raise exception 'team code too short';
  end if;
  return encode(extensions.digest('wnl:' || p_code, 'sha256'), 'hex');
end $$;

-- Read roster + attendance changed since p_since
create or replace function public.wnl_pull(p_code text, p_since timestamptz default null)
returns jsonb language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_team text := public.wnl_team_id(p_code);
  v_t    public.wnl_teams%rowtype;
  v_att  jsonb;
begin
  select * into v_t from public.wnl_teams where team = v_team;
  if not found then
    return jsonb_build_object('exists', false, 'now', now());
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('d', a.d, 'wid', a.wid, 'rec', a.rec)), '[]'::jsonb)
    into v_att
    from public.wnl_att a
   where a.team = v_team and (p_since is null or a.updated_at > p_since - interval '2 minutes');
  return jsonb_build_object('exists', true, 'roster', v_t.roster, 'roster_at', v_t.roster_at,
                            'att', v_att, 'now', now());
end $$;

-- Save roster (workers, phones, rules, settings). Creates the team on first use.
create or replace function public.wnl_push_roster(p_code text, p_roster jsonb)
returns jsonb language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_team text := public.wnl_team_id(p_code);
begin
  insert into public.wnl_teams (team, roster, roster_at) values (v_team, p_roster, now())
  on conflict (team) do update set roster = excluded.roster, roster_at = now();
  return jsonb_build_object('ok', true, 'roster_at', now());
end $$;

-- Save attendance rows: [{ "d": "2026-11-04", "wid": "0079072", "rec": {...} | null }, ...]
create or replace function public.wnl_push_att(p_code text, p_rows jsonb)
returns jsonb language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_team text := public.wnl_team_id(p_code);
begin
  if not exists (select 1 from public.wnl_teams where team = v_team) then
    raise exception 'team not found';
  end if;
  insert into public.wnl_att (team, d, wid, rec, updated_at)
  select v_team, r->>'d', r->>'wid',
         case when jsonb_typeof(r->'rec') = 'object' then r->'rec' else null end,
         now()
    from jsonb_array_elements(p_rows) r
   where coalesce(r->>'d', '') <> '' and coalesce(r->>'wid', '') <> ''
  on conflict (team, d, wid) do update set rec = excluded.rec, updated_at = now();
  return jsonb_build_object('ok', true, 'now', now());
end $$;

-- Clear all attendance for a team (other phones see it as deletions)
create or replace function public.wnl_clear_att(p_code text)
returns jsonb language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_team text := public.wnl_team_id(p_code);
begin
  update public.wnl_att set rec = null, updated_at = now() where team = v_team and rec is not null;
  return jsonb_build_object('ok', true, 'now', now());
end $$;

grant execute on function public.wnl_pull(text, timestamptz)   to anon, authenticated;
grant execute on function public.wnl_push_roster(text, jsonb)  to anon, authenticated;
grant execute on function public.wnl_push_att(text, jsonb)     to anon, authenticated;
grant execute on function public.wnl_clear_att(text)           to anon, authenticated;
