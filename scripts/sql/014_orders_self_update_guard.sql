-- update_own_or_admin(012_orders_table.sql) 정책은 "본인 주문이면 UPDATE 가능"까지만 막아주고,
-- 어떤 컬럼을 어떤 값으로 바꿀 수 있는지는 전혀 제한하지 않는다. UI는 사용자에게
-- 주문취소(취소)/반품신청(반품요청)만 노출하지만, RLS만으로는 브라우저 콘솔에서
-- shipping_status를 '배송완료'로 바꾸거나 items·shipping_fee 등 주문 내용 자체를
-- 변조하는 것도 막을 수 없다. WITH CHECK는 NEW 행만 보고 OLD와 비교할 수 없어서
-- "이 컬럼은 안 바뀌었는지" 검증이 불가능하므로, BEFORE UPDATE 트리거로 방어한다.
--
-- 허용 범위는 실제 클라이언트 코드(OrderHistoryContext.tsx) 기준:
--   - updateShippingStatuses: 사용자는 결제완료/배송준비 → 취소로만 전이 가능(CANCELABLE_SHIPPING_STATUSES)
--   - requestReturn: 배송완료 상태에서 반품요청으로만 전이 가능
--   - 반품접수/반품완료 전이(updateReturnStatus)는 관리자 전용 화면(OrderManage)에서만 호출됨
-- 관리자는 is_admin()이면 전부 통과.

create or replace function public.restrict_order_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.items is distinct from old.items
     or new.shipping_fee is distinct from old.shipping_fee
     or new.shipping_name is distinct from old.shipping_name
     or new.shipping_phone is distinct from old.shipping_phone
     or new.shipping_address is distinct from old.shipping_address
     or new.shipping_address_detail is distinct from old.shipping_address_detail
     or new.delivery_request is distinct from old.delivery_request
     or new.delivered_at is distinct from old.delivered_at
     or new.date is distinct from old.date
     or new.user_id is distinct from old.user_id
     or new.user_email is distinct from old.user_email then
    raise exception '주문 내용은 수정할 수 없습니다';
  end if;

  if new.shipping_status is distinct from old.shipping_status then
    if not (old.shipping_status in ('결제완료', '배송준비') and new.shipping_status = '취소') then
      raise exception '배송 상태를 직접 변경할 수 없습니다';
    end if;
  end if;

  if new.return_status is distinct from old.return_status then
    if not (old.shipping_status = '배송완료' and old.return_status is null and new.return_status = '반품요청') then
      raise exception '반품 신청 조건이 아닙니다';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_restrict_self_update on public.orders;
create trigger orders_restrict_self_update
  before update on public.orders
  for each row execute function public.restrict_order_self_update();
