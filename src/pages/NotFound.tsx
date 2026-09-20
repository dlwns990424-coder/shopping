import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100dvh-var(--mobile-header-height))] flex-col items-center justify-center gap-16 px-20 py-64 text-center md:min-h-[calc(100dvh-var(--tablet-header-height))] lg:min-h-560">
      <Helmet>
        <title>NOVERA | 페이지를 찾을 수 없습니다</title>
      </Helmet>
      <p className="text-h3">요청하신 페이지를 찾을 수 없습니다.</p>
      <Button
        variant="primary"
        size="large"
        className="h-44 !py-0"
        onClick={() => navigate('/men')}
      >
        홈으로 이동
      </Button>
    </div>
  )
}

export default NotFound
