// 한글 종성(받침) 유무에 따라 알맞은 조사를 고른다.
// 완성형 한글 범위 밖(영문/숫자 등)으로 끝나면 받침이 있는 쪽을 기본값으로 쓴다.
function hasBatchim(word: string): boolean {
  const lastChar = word.trim().slice(-1)
  const code = lastChar.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return true
  return (code - 0xac00) % 28 !== 0
}

export function subjectJosa(word: string): string {
  return hasBatchim(word) ? '이' : '가'
}
