export function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
}
