import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import { useProducts } from '../../context/ProductsContext'
import { computeBestsellers } from '../../utils/bestsellers'

// "베스트 상품"은 매번 실시간 집계하지 않고, 관리자가 이 버튼을 눌렀을 때만
// 최근 30일 판매량 기준으로 재계산해서 bestseller_snapshot 테이블에 저장한다
// (026_bestseller_snapshot.sql). Home/Men/Women의 베스트 TOP5 행은 이 스냅샷을 읽어서
// 노출한다 — 이 프로젝트의 다른 콘텐츠(배너 등)는 전부 "즉시 저장"이지만, 베스트는
// 주문 데이터를 매번 훑는 계산 비용 때문에 예외적으로 수동 갱신 버튼을 둔다.
const BEST_DAYS = 30
const SNAPSHOT_LIMIT = 20

interface SnapshotRow {
  rank: number
  product_id: string
  quantity: number
  computed_at: string
}

function BestsellerManager() {
  const { orders } = useOrderHistory()
  const { products } = useProducts()
  const [snapshot, setSnapshot] = useState<SnapshotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('bestseller_snapshot').select('*').order('rank', { ascending: true })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSnapshot(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const since = new Date()
      since.setDate(since.getDate() - (BEST_DAYS - 1))
      const sinceDate = since.toISOString().slice(0, 10)

      const entries = computeBestsellers(orders, products, sinceDate, SNAPSHOT_LIMIT)

      const { error: deleteError } = await supabase.from('bestseller_snapshot').delete().gte('rank', 0)
      if (deleteError) throw deleteError

      if (entries.length > 0) {
        const rows = entries.map((entry, index) => ({
          rank: index + 1,
          product_id: entry.productId,
          quantity: entry.quantity,
        }))
        const { error: insertError } = await supabase.from('bestseller_snapshot').insert(rows)
        if (insertError) throw insertError
      }

      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '베스트 갱신에 실패했습니다.')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  const productById = new Map(products.map((product) => [product.id, product]))
  const lastComputedAt = snapshot[0]?.computed_at

  return (
    <div className="flex flex-col gap-16 rounded-md border border-line p-16">
      <h3 className="text-body-lg font-bold">베스트 상품</h3>
      <p className="text-caption text-secondary">
        최근 {BEST_DAYS}일 판매수량 기준 TOP {SNAPSHOT_LIMIT}. Home/Men/Women의 베스트 행은 여기 저장된 스냅샷을
        그대로 보여주므로, 새 주문이 쌓여도 아래 버튼을 눌러야 반영됩니다.
      </p>
      {error && <p className="text-body-sm text-danger">{error}</p>}

      <div className="flex items-center gap-12">
        <Button size="small" onClick={refresh} disabled={refreshing}>
          {refreshing ? '갱신 중...' : '지금 기준으로 갱신'}
        </Button>
        <span className="text-caption text-secondary">
          {lastComputedAt ? `마지막 갱신: ${new Date(lastComputedAt).toLocaleString('ko-KR')}` : '아직 갱신한 적 없음'}
        </span>
      </div>

      {snapshot.length === 0 ? (
        <p className="text-body-sm text-secondary">저장된 베스트 상품이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-320 border-collapse text-left">
            <thead>
              <tr className="text-body-sm border-b border-line text-secondary">
                <th className="py-8 pr-16">순위</th>
                <th className="py-8 pr-16">상품</th>
                <th className="py-8 pl-16 text-right">판매수량</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.map((row) => (
                <tr key={row.rank} className="text-body-sm border-b border-line">
                  <td className="py-8 pr-16">{row.rank}</td>
                  <td className="py-8 pr-16">{productById.get(row.product_id)?.name ?? '(삭제된 상품)'}</td>
                  <td className="py-8 pl-16 text-right">{row.quantity}개</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BestsellerManager
