-- guest_session_id: 비회원 reading 소유권 검증용
alter table saju_readings
  add column if not exists guest_session_id text;

create index if not exists idx_saju_readings_guest_session_id
  on saju_readings(guest_session_id)
  where user_id is null;

comment on column saju_readings.guest_session_id is
  '비회원 세션 식별자. 브라우저 HttpOnly 쿠키와 매칭하여 소유권 검증에 사용.';
