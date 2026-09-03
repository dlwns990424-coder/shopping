import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = '이메일을 입력해주세요.'
    if (!form.password.trim()) nextErrors.password = '비밀번호를 입력해주세요.'

    if (Object.keys(nextErrors).length === 0) {
      // Supabase Auth 연동 후 실제 로그인 요청으로 교체 예정 (지금은 localStorage 기반 목업 계정 조회)
      const result = login(form.email, form.password)
      if (!result.success) {
        nextErrors.password = result.message
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title text-h1">로그인</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

          <Button type="submit" className="auth-form__submit">
            로그인
          </Button>
        </form>

        <p className="auth-footer text-body">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
