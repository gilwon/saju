-- star_transactions 테이블 생성 (없는 경우)
create table if not exists star_transactions (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references auth.users(id),
  amount                int  not null,
  balance_after         int  not null,
  type                  text not null,           -- 'report' | 'purchase' | 'bonus' 등
  reading_id            uuid references saju_readings(id),
  paddle_transaction_id text,
  product_type          text,
  created_at            timestamptz default now()
);

-- RLS
alter table star_transactions enable row level security;

create policy "Users can read own transactions" on star_transactions
  for select using (auth.uid() = user_id);

-- paddle_transaction_id UNIQUE 제약 (중복 웹훅 방지)
alter table star_transactions
  drop constraint if exists star_transactions_paddle_tx_key;

alter table star_transactions
  add constraint star_transactions_paddle_tx_key
  unique (paddle_transaction_id);

-- add_stars_idempotent: Paddle 웹훅 멱등 처리
create or replace function add_stars_idempotent(
  p_user_id               uuid,
  p_amount                int,
  p_paddle_transaction_id text,
  p_product_type          text
)
returns table(success boolean, new_balance int, is_duplicate boolean)
language plpgsql
security definer
as $$
declare
  v_balance int;
begin
  -- 중복 체크: 이미 처리된 트랜잭션이면 현재 잔액만 반환
  if exists (
    select 1 from star_transactions
     where paddle_transaction_id = p_paddle_transaction_id
  ) then
    select balance into v_balance from user_stars where user_id = p_user_id;
    return query select true, coalesce(v_balance, 0), true;
    return;
  end if;

  -- user_stars upsert (신규 유저 = 가입 보너스 3 + 충전분)
  insert into user_stars (user_id, balance)
  values (p_user_id, 3 + p_amount)
  on conflict (user_id) do update
    set balance    = user_stars.balance + p_amount,
        updated_at = now()
  returning balance into v_balance;

  -- 거래 이력 기록 (UNIQUE 제약으로 중복 방지)
  insert into star_transactions
    (user_id, amount, balance_after, type, paddle_transaction_id, product_type)
  values
    (p_user_id, p_amount, v_balance, 'purchase', p_paddle_transaction_id, p_product_type);

  return query select true, v_balance, false;
end;
$$;

comment on function add_stars_idempotent(uuid, int, text, text) is
  'Paddle 웹훅 전용. paddle_transaction_id 기반 멱등성 보장.';
