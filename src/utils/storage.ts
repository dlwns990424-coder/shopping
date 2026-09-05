export function safeSetItem(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 용량 초과, 시크릿 모드 등으로 저장 실패 시 조용히 무시(읽기 쪽과 동일한 처리)
  }
}
