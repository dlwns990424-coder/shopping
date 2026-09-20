const DAUM_POSTCODE_SCRIPT_ID = 'daum-postcode-script'
const DAUM_POSTCODE_SCRIPT_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let postcodeScriptPromise: Promise<void> | null = null

function loadDaumPostcode() {
  if (window.daum?.Postcode) return Promise.resolve()
  if (postcodeScriptPromise) return postcodeScriptPromise

  postcodeScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(DAUM_POSTCODE_SCRIPT_ID) as HTMLScriptElement | null
    const script = existingScript ?? document.createElement('script')

    const handleLoad = () => {
      if (window.daum?.Postcode) resolve()
      else reject(new Error('주소 검색 모듈을 초기화하지 못했습니다.'))
    }
    const handleError = () => reject(new Error('주소 검색 모듈을 불러오지 못했습니다.'))

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.id = DAUM_POSTCODE_SCRIPT_ID
      script.src = DAUM_POSTCODE_SCRIPT_URL
      script.async = true
      document.head.appendChild(script)
    }
  }).catch((error) => {
    postcodeScriptPromise = null
    document.getElementById(DAUM_POSTCODE_SCRIPT_ID)?.remove()
    throw error
  })

  return postcodeScriptPromise
}

export function useDaumPostcodeSearch(onComplete: (roadAddress: string) => void) {
  return async () => {
    try {
      await loadDaumPostcode()
      if (!window.daum?.Postcode) throw new Error('주소 검색 모듈을 사용할 수 없습니다.')

      new window.daum.Postcode({
        oncomplete: (data) => onComplete(data.roadAddress),
      }).open()
    } catch (error) {
      console.error('주소 검색을 불러오지 못했습니다.', error)
      window.alert('주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    }
  }
}
