import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import Toast from '../components/Toast'
import { NICKNAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX, PHONE_REGEX } from '../utils/validators'

interface FormState {
  nickname: string
  email: string
  password: string
  phone: string
}

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState<FormState>({ nickname: '', email: '', password: '', phone: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [showToast, setShowToast] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    if (!NICKNAME_REGEX.test(form.nickname)) {
      nextErrors.nickname = '닉네임은 영문/한글/숫자 2~10자로 입력해주세요.'
    }
    if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      nextErrors.password = '비밀번호는 영문/숫자를 포함해 8~16자로 입력해주세요.'
    }
    if (!PHONE_REGEX.test(form.phone)) {
      nextErrors.phone = '휴대폰번호를 정확하게 입력해주세요.'
    }
    return nextErrors
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length === 0) {
      setSubmitting(true)
      const result = await signup(form)
      setSubmitting(false)
      if (!result.success) {
        nextErrors.email = result.message
      }
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setShowToast(true)
  }

  return (
    <div className="flex justify-center px-24 pb-96 pt-48 lg:pb-128 lg:pt-96">
      <Helmet>
        <title>NOVERA | 회원가입</title>
      </Helmet>
      <div className="flex w-full max-w-400 flex-col gap-32">
        <h1 className="text-h1 text-center">회원가입</h1>

        <form className="flex flex-col gap-16" onSubmit={handleSubmit} noValidate>
          <Input
            id="signup-nickname"
            label="닉네임"
            placeholder="2~10자 (영문/한글/숫자)"
            value={form.nickname}
            onChange={handleChange('nickname')}
            error={errors.nickname}
          />
          <Input
            id="signup-email"
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
          />
          <Input
            id="signup-password"
            label="비밀번호"
            type="password"
            placeholder="영문/숫자 포함 8~16자"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
          />
          <Input
            id="signup-phone"
            label="휴대폰번호"
            type="tel"
            placeholder="010-1234-5678 (- 없이 입력 가능)"
            value={form.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
          />

          <Button type="submit" className="mt-8 w-full" disabled={submitting}>
            {submitting ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <p className="text-body text-center text-secondary">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-primary no-underline hover:text-point">
            로그인
          </Link>
        </p>
      </div>

      <Toast
        message="회원가입이 완료되었습니다."
        show={showToast}
        onClose={() => navigate('/login')}
      />
    </div>
  )
}

export default Signup
