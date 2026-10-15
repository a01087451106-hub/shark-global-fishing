-- =========================================================
-- SHARK GLOBAL FISHING · Supabase 데이터베이스 설정
-- Supabase 대시보드 → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run
-- (여러 번 실행해도 안전하게 만들어 두었어요)
-- =========================================================

-- ---------- 낚시꾼 프로필 (닉네임 · 칭호) ----------
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    nickname text not null unique check (char_length(nickname) between 2 and 12),
    title text default '' check (char_length(title) <= 40),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ---------- 게임 저장 (기기끼리 이어하기) ----------
create table if not exists public.saves (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null,
    updated_at timestamptz not null default now(),
    check (pg_column_size(data) < 400000)
);

-- ---------- 잡은 물고기 (랭킹 · 대물 소식) ----------
create table if not exists public.catches (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    nickname text not null default '',
    title text not null default '',
    fish_id text not null,
    length numeric not null check (length > 0),
    weight numeric not null check (weight > 0),
    grade text not null check (grade in ('NORMAL', 'GOOD', 'BIG', 'TROPHY', 'MONSTER')),
    grade_label text not null default '',
    region_id text not null default '',
    method text not null default '',
    difficulty text not null default '',
    created_at timestamptz not null default now()
);
create index if not exists catches_fish_weight on public.catches (fish_id, weight desc);
create index if not exists catches_created on public.catches (created_at desc);

-- ---------- 보안 규칙 (RLS) ----------
alter table public.profiles enable row level security;
alter table public.saves enable row level security;
alter table public.catches enable row level security;

drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "saves own" on public.saves;
create policy "saves own" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "catches read" on public.catches;
drop policy if exists "catches insert own" on public.catches;
create policy "catches read" on public.catches for select using (true);
create policy "catches insert own" on public.catches for insert with check (auth.uid() = user_id);

-- ---------- 기록 검사: 말이 안 되는 크기 · 너무 빠른 연속 등록은 거절 ----------
create or replace function public.check_catch() returns trigger
language plpgsql security definer set search_path = public as $$
declare
    max_len numeric;
    last_at timestamptz;
begin
    -- 어종별 최대 길이(cm) · data/fish-data.js 의 sizeRange.max 와 같게 유지
    max_len := case new.fish_id
        when 'amberjack' then 170 when 'yellowtail' then 130 when 'spanish_mackerel' then 130
        when 'tuna' then 220 when 'squid' then 50 when 'octopus' then 35 when 'gt' then 170
        when 'kingfish' then 180 when 'yellowfin' then 220 when 'bluefin' then 320
        when 'bigeye' then 230 when 'dogtooth' then 210 when 'mahimahi' then 200
        when 'wahoo' then 230 when 'marlin' then 450 when 'sailfish' then 320
        when 'roosterfish' then 160 when 'halibut' then 300 when 'cod' then 180
        when 'snapper' then 110
        else null end;
    if max_len is null then raise exception 'unknown fish'; end if;
    if new.length > max_len * 1.001 then raise exception 'too long'; end if;
    if new.weight > 900 then raise exception 'too heavy'; end if;

    -- 한 사람이 8초 안에 또 등록하면 거절 (한 마리 잡는 데 최소 그 정도는 걸림)
    select max(created_at) into last_at from public.catches where user_id = new.user_id;
    if last_at is not null and now() - last_at < interval '8 seconds' then
        raise exception 'too fast';
    end if;

    -- 닉네임 · 칭호는 프로필에서 가져옴 (남의 이름으로 못 올림)
    select p.nickname, coalesce(p.title, '') into new.nickname, new.title
        from public.profiles p where p.id = new.user_id;
    if new.nickname is null then raise exception 'no profile'; end if;
    new.created_at := now();
    return new;
end $$;

drop trigger if exists catches_check on public.catches;
create trigger catches_check before insert on public.catches
    for each row execute function public.check_catch();

-- ---------- 어종별 랭킹: 한 사람당 가장 무거운 1마리 ----------
create or replace view public.fish_rank with (security_invoker = true) as
select distinct on (c.fish_id, c.user_id)
    c.fish_id, c.user_id, p.nickname, p.title, c.length, c.weight, c.grade, c.grade_label, c.region_id, c.difficulty, c.created_at
from public.catches c
join public.profiles p on p.id = c.user_id
order by c.fish_id, c.user_id, c.weight desc, c.created_at asc;

-- ---------- 실시간 대물 소식 ----------
do $$ begin
    alter publication supabase_realtime add table public.catches;
exception when duplicate_object then null; end $$;
