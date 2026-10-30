-- ربط أجهزة المقهى (Supabase) — الصق هذا الكود كاملاً في SQL Editor ثم اضغط Run (مرة وحدة، وتكراره آمن)
-- الجدول مقفول بالكامل؛ الوصول فقط عبر الدوال بالأسفل، وأي سجل ما يُقرأ إلا برمز المحل السري
-- وكل البيانات تصل هنا مشفّرة من الجهاز، فالخدمة نفسها ما تقدر تقرأ محتواها

create sequence if not exists public.cafe_seq;

create table if not exists public.cafe_rec (
  shop text not null,
  k    text not null,
  dev  text not null,
  d    text not null,
  seq  bigint not null default nextval('public.cafe_seq'),
  at   timestamptz not null default now(),
  primary key (shop, k)
);
create index if not exists cafe_rec_seq on public.cafe_rec (shop, seq);

alter table public.cafe_rec enable row level security;
revoke all on table public.cafe_rec from anon, authenticated;
revoke all on sequence public.cafe_seq from anon, authenticated;

-- رفع سجلات (جديدة أو معدّلة): آخر رفع يغلب، ولكل سجل رقم تسلسلي جديد عند كل تعديل
create or replace function public.cafe_push(p_shop text, p_rows jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_shop is null or length(p_shop) < 32 then raise exception 'bad shop'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 1000 then raise exception 'bad rows'; end if;
  insert into cafe_rec (shop, k, dev, d)
    select distinct on (t.r ->> 'k') p_shop, t.r ->> 'k', t.r ->> 'dev', t.r ->> 'd'
    from jsonb_array_elements(p_rows) with ordinality as t(r, i)
    where length(t.r ->> 'd') <= 1500000
    order by t.r ->> 'k', t.i desc
  on conflict (shop, k) do update
    set dev = excluded.dev, d = excluded.d, seq = nextval('public.cafe_seq'), at = now();
  get diagnostics n = row_count;
  return n;
end $$;

-- سحب السجلات الأحدث من رقم معيّن؛ age = كم ثانية مرّت على كتابة السجل
create or replace function public.cafe_pull(p_shop text, p_after bigint default 0, p_lim integer default 500)
returns table (seq bigint, k text, dev text, d text, age integer)
language plpgsql security definer set search_path = public as $$
begin
  if p_shop is null or length(p_shop) < 32 then raise exception 'bad shop'; end if;
  return query
    select r.seq, r.k, r.dev, r.d, extract(epoch from (clock_timestamp() - r.at))::integer
    from cafe_rec r
    where r.shop = p_shop and r.seq > p_after
    order by r.seq
    limit least(greatest(p_lim, 1), 1000);
end $$;

-- عدد السجلات المخزّنة للمحل (للتأكد أن كل شيء وصل)
create or replace function public.cafe_count(p_shop text)
returns bigint language plpgsql security definer set search_path = public as $$
begin
  if p_shop is null or length(p_shop) < 32 then raise exception 'bad shop'; end if;
  return (select count(*) from cafe_rec where shop = p_shop);
end $$;

-- آخر رقم تسلسلي للمحل (يبدأ منه الجهاز الأول بعد رفع بياناته)
create or replace function public.cafe_head(p_shop text)
returns bigint language plpgsql security definer set search_path = public as $$
begin
  if p_shop is null or length(p_shop) < 32 then raise exception 'bad shop'; end if;
  return (select coalesce(max(seq), 0) from cafe_rec where shop = p_shop);
end $$;

revoke all on function public.cafe_push(text, jsonb) from public;
revoke all on function public.cafe_pull(text, bigint, integer) from public;
revoke all on function public.cafe_count(text) from public;
revoke all on function public.cafe_head(text) from public;
grant execute on function public.cafe_push(text, jsonb) to anon, authenticated;
grant execute on function public.cafe_pull(text, bigint, integer) to anon, authenticated;
grant execute on function public.cafe_count(text) to anon, authenticated;
grant execute on function public.cafe_head(text) to anon, authenticated;
