-- 사주 프로필 테이블: 자주 사용하는 사람 정보를 저장
create table if not exists saju_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  birth_year integer not null check (birth_year between 1900 and 2100),
  birth_month integer not null check (birth_month between 1 and 12),
  birth_day integer not null check (birth_day between 1 and 31),
  birth_hour integer check (birth_hour between 0 and 23),
  is_lunar boolean not null default false,
  is_leap_month boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_saju_profiles_user_id
  on saju_profiles(user_id);

alter table saju_profiles enable row level security;

create policy "Users can manage their own profiles"
  on saju_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table saju_profiles is '자주 사용하는 사람의 생년월일 정보를 저장하여 반복 입력 없이 사주 분석 가능';
