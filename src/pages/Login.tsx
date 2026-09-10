import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

interface FormState {
  email: string
  password: string
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.email.trim()) nextErrors.email = '이메일을 입력해주세요.'
    if (!form.password.trim()) nextErrors.password = '비밀번호를 입력해주세요.'

    if (Object.keys(nextErrors).length === 0) {
      setSubmitting(true)
      const result = await login(form.email, form.password)
      setSubmitting(false)
      if (!result.success) {
        nextErrors.password = result.message
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    navigate('/')
  }

  return (
    <div className="flex justify-center px-20 pb-96 pt-48 lg:pb-128 lg:pt-96">
      <Helmet>
        <title>NOVERA | 로그인</title>
      </Helmet>
      <div className="flex w-full max-w-400 flex-col gap-32">
        <h1 className="text-h1 text-center">로그인</h1>

        <form className="flex flex-col gap-16" onSubmit={handleSubmit} noValidate>
          <Input
            id="login-email"
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
          />
          <Input
            id="login-password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
          />

          <Button type="submit" className="mt-8 w-full" disabled={submitting}>
            {submitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <p className="text-body text-center text-secondary">
          아직 계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-primary no-underline hover:text-point">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
