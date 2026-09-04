import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from './Input'
import Button from './Button'
import Toast from './Toast'

const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣]{2,10}$/
const PHONE_REGEX = /^01[0-9]-?\d{3,4}-?\d{4}$/

interface FormState {
  nickname: string
  phone: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
}

function AccountSettingsForm() {
  const { user, updateProfile } = useAuth()

  const [form, setForm] = useState<FormState>({
    nickname: user?.nickname ?? '',
    phone: user?.phone ?? '',
    shippingName: user?.shippingName ?? '',
    shippingPhone: user?.shippingPhone ?? '',
    shippingAddress: user?.shippingAddress ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [showToast, setShowToast] = useState(false)

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    if (!NICKNAME_REGEX.test(form.nickname)) {
      nextErrors.nickname = '닉네임은 영문/한글/숫자 2~10자로 입력해주세요.'
    }
    if (!PHONE_REGEX.test(form.phone)) {
      nextErrors.phone = '휴대폰번호를 정확하게 입력해주세요.'
    }
    if (!form.shippingName.trim()) {
      nextErrors.shippingName = '수령인을 입력해주세요.'
    }
    if (!PHONE_REGEX.test(form.shippingPhone)) {
      nextErrors.shippingPhone = '연락처를 정확하게 입력해주세요.'
    }
    if (!form.shippingAddress.trim()) {
      nextErrors.shippingAddress = '주소를 입력해주세요.'
    }
    return nextErrors
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    updateProfile(form)
    setShowToast(true)
  }

  return (
    <div>
      <form className="flex max-w-400 flex-col gap-32" onSubmit={handleSubmit} noValidate>
        <section className="flex flex-col gap-16">
          <h2 className="text-h3">회원정보</h2>
          <Input
            id="mypage-nickname"
            label="닉네임"
            value={form.nickname}
            onChange={handleChange('nickname')}
            error={errors.nickname}
          />
          <Input id="mypage-email" label="이메일" value={user!.email} disabled />
          <Input
            id="mypage-phone"
            label="휴대폰번호"
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
          />
        </section>

        <section className="flex flex-col gap-16">
          <h2 className="text-h3">배송정보</h2>
          <Input
            id="mypage-shipping-name"
            label="수령인"
            value={form.shippingName}
            onChange={handleChange('shippingName')}
            error={errors.shippingName}
          />
          <Input
            id="mypage-shipping-phone"
            label="연락처"
            type="tel"
            value={form.shippingPhone}
            onChange={handleChange('shippingPhone')}
            error={errors.shippingPhone}
          />
          <Input
            id="mypage-shipping-address"
            label="주소"
            value={form.shippingAddress}
            onChange={handleChange('shippingAddress')}
            error={errors.shippingAddress}
          />
        </section>

        <Button type="submit" className="w-full">
          저장
        </Button>
      </form>

      <Toast message="저장되었습니다." show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default AccountSettingsForm
