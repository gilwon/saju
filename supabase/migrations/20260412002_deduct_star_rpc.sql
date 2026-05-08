-- deduct_star: atomic star deduction (race condition 방지)
create or replace function deduct_star(p_user_id uuid, p_amount int)
returns table(success boolean, new_balance int)
language plpgsql
security definer
as $$
declare
  v_balance int;
begin
  update user_stars
  set balance     = balance - p_amount,
      updated_at  = now()
  where user_id = p_user_id
    and balance >= p_amount
  returning balance into v_balance;

  if v_balance is null then
    return query select false, 0;
  else
    -- 거래 이력 기록은 호출 측에서 처리
    return query select true, v_balance;
  end if;
end;
$$;

comment on function deduct_star(uuid, int) is
  '별 차감 atomic 함수. balance >= amount 인 경우만 차감 성공.';
