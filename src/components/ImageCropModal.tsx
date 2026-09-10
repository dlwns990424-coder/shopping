import { useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import Button from './Button'
import { getCroppedImageBlob, type CropArea } from '../utils/cropImage'

interface ImageCropModalProps {
  file: File
  aspect: number
  // 히어로 섹션처럼 고정 헤더가 이미지 위에 겹쳐지는 경우, 상단 중 헤더가 항상 가리는
  // 비율(크롭 높이 대비)을 넘기면 그 영역을 별도로 표시한다. 안 넘기면 표시 안 함.
  topDangerZoneRatio?: number
  onCancel: () => void
  onConfirm: (blob: Blob) => void
}

function ImageCropModal({ file, aspect, topDangerZoneRatio, onCancel, onConfirm }: ImageCropModalProps) {
  // zoom이 정확히 1이면 라이브러리가 이미지를 크롭 박스에 딱 맞는 최소 크기로 놓는데,
  // 이 경우 가로/세로 중 한 축은 이미지 경계와 완전히 일치해서 그 방향으로는 드래그해도
  // 전혀 움직이지 않는다(사용자에게는 "크롭이 고정돼서 안 움직인다"는 버그처럼 보임).
  // 시작 zoom을 최소값보다 아주 살짝만 높게 잡아서 두 방향 모두 움직일 여지는 주되,
  // 처음 열었을 때 불필요하게 확대된 것처럼 보이지 않게 한다(예전엔 1.2라 과하게 확대돼 보였음 —
  // 원본 비율과 크롭 비율이 많이 다른 이미지일수록 이 여유값이 그대로 손실로 이어지므로 최소화).
  const INITIAL_ZOOM = 1.03

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [processing, setProcessing] = useState(false)
  const [cropBoxSize, setCropBoxSize] = useState<{ width: number; height: number } | null>(null)

  // 실제 사이트는 화면 크기에 따라 이 프레임보다 더 타이트하게 잘릴 수 있다(예: hero의
  // h-screen 배경은 브라우저 창의 실제 표시 영역 비율 그대로 적용됨). 그래서 바깥 프레임
  // 안에 "여기 안쪽에만 두면 어떤 화면에서도 안 잘림"을 보여주는 안전영역을 겹쳐 그린다.
  const SAFE_ZONE_RATIO = 0.7
  const CROP_CONTAINER_HEIGHT = 320

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleConfirm = async () => {
    if (!imageUrl || !croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImageBlob(imageUrl, croppedAreaPixels)
      onConfirm(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
      <div className="flex w-full max-w-480 flex-col gap-16 rounded-md bg-surface p-24">
        <p className="text-h3">보여질 영역 선택</p>

        <div
          className="relative w-full overflow-hidden rounded-sm bg-surface-muted"
          style={{ height: CROP_CONTAINER_HEIGHT }}
        >
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
              onCropSizeChange={setCropBoxSize}
            />
          )}
          {cropBoxSize && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed border-surface"
              style={{
                width: cropBoxSize.width * SAFE_ZONE_RATIO,
                height: cropBoxSize.height * SAFE_ZONE_RATIO,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
              }}
            />
          )}
          {cropBoxSize && topDangerZoneRatio && (
            <div
              className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-start justify-center bg-black/45"
              style={{
                top: (CROP_CONTAINER_HEIGHT - cropBoxSize.height) / 2,
                width: cropBoxSize.width,
                height: cropBoxSize.height * topDangerZoneRatio,
              }}
            >
              <span className="text-caption pt-2 text-surface">헤더에 가려짐</span>
            </div>
          )}
        </div>
        <p className="text-caption text-secondary">
          안쪽 점선 안에 얼굴 등 핵심 요소를 두면 화면 크기와 상관없이 항상 보입니다. 상하좌우로 잘 안
          움직이면 확대를 조금 더 올려주세요.
          {topDangerZoneRatio && ' 어두운 상단 띠 안에는 얼굴 등 중요한 부분을 두지 마세요(헤더에 가려집니다).'}
        </p>

        <div className="flex items-center gap-12">
          <span className="text-caption shrink-0 text-secondary">확대</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <Button variant="primary" size="large" className="w-full" onClick={handleConfirm} disabled={processing}>
            {processing ? '적용 중...' : '적용'}
          </Button>
          <Button variant="secondary" size="large" className="w-full" onClick={onCancel} disabled={processing}>
            취소
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropModal
