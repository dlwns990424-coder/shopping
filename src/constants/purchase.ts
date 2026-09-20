export const MAX_ORDER_QUANTITY = 999

export function clampOrderQuantity(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(MAX_ORDER_QUANTITY, Math.max(1, Math.trunc(value)))
}
