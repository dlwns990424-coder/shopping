import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

interface NotFoundProps {
  title?: string
  message?: string
  documentTitle?: string
}

export function NotFoundContent({
  title = '요청하신 페이지를 찾을 수 없습니다.',
  message = '주소가 변경되었거나 삭제된 페이지일 수 있습니다.',
  documentTitle = '페이지를 찾을 수 없습니다 | NOVERA',
}: NotFoundProps) {
  const navigate = useNavigate()

  return (
    <div className="utility-page-min-height flex flex-col items-center justify-center px-20 py-64 text-center md:px-32">
      <Helmet>
        <title>{documentTitle}</title>
      </Helmet>
      <p className="text-h3">{title}</p>
      <p className="text-body-sm mt-8 text-secondary">{message}</p>
      <Button
        variant="primary"
        size="large"
        className="mt-24 h-44 w-full max-w-240 !py-0"
        onClick={() => navigate('/men')}
      >
        홈으로 이동
      </Button>
    </div>
  )
}

function NotFound() {
  return <NotFoundContent />
}

export default NotFound
