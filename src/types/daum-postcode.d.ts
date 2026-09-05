export interface DaumPostcodeData {
  zonecode: string
  address: string
  roadAddress: string
  jibunAddress: string
  buildingName: string
  apartment: 'Y' | 'N'
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: DaumPostcodeOptions) => { open: () => void }
    }
  }
}
