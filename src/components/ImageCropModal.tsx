import { useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import Button from './Button'
import { getCroppedImageBlob, type CropArea } from '../utils/cropImage'

interface ImageCropModalProps {
  file: File
  aspect: number
  onCancel: () => void
  onConfirm: (blob: Blob) => void
}

function ImageCropModal({ file, aspect, onCancel, onConfirm }: ImageCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [processing, setProcessing] = useState(false)

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

        <div className="relative h-320 w-full overflow-hidden rounded-sm bg-surface-muted">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
            />
          )}
        </div>

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
