export function useDaumPostcodeSearch(onComplete: (roadAddress: string) => void) {
  return () => {
    new window.daum.Postcode({
      oncomplete: (data) => onComplete(data.roadAddress),
    }).open()
  }
}
