import { useEffect, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronDown } from 'lucide-react'
import { useDaumPostcodeSearch } from '../hooks/useDaumPostcodeSearch'
import OrderItemRow from '../components/OrderItemRow'
import Checkbox from '../components/Checkbox'
import Input from '../components/Input'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import type { CartItem } from '../types'
import { SHIPPING_FEE } from '../constants'
import { formatPrice } from '../utils/formatPrice'

const PHONE_REGEX = /^01[0-9]-?\d{3,4}-?\d{4}$/
const CHECKOUT_ITEMS_KEY = 'shop_checkout_items'

const DELIVERY_REQUEST_PRESETS = [
  '문 앞에 놓아주세요',
  '경비실에 맡겨주세요',
  '배송 전 연락 바랍니다',
  '직접 입력',
]

interface ShippingForm {
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingAddressDetail: string
}

function validateShipping(form: ShippingForm): Partial<Record<keyof ShippingForm, string>> {
  const errors: Partial<Record<keyof ShippingForm, string>> = {}
  if (!form.shippingName.trim()) {
    errors.shippingName = '수령인을 입력해주세요.'
  }
  if (!PHONE_REGEX.test(form.shippingPhone)) {
    errors.shippingPhone = '연락처를 정확한 형식으로 입력해주세요. (예: 010-1234-5678)'
  }
  if (!form.shippingAddress.trim()) {
    errors.shippingAddress = '주소를 입력해주세요.'
  }
  return errors
}

function Order() {
  const { user, updateProfile } = useAuth()
  const { removeItems } = useCart()
  const { addOrder } = useOrderHistory()
  const location = useLocation()
  const navigate = useNavigate()
  const stateItems = (location.state as { items?: CartItem[] } | null)?.items
  const [items, setItems] = useState<CartItem[] | null>(() => {
    if (stateItems && stateItems.length > 0) return stateItems
    try {
      const stored = sessionStorage.getItem(CHECKOUT_ITEMS_KEY)
      return stored ? (JSON.parse(stored) as CartItem[]) : null
    } catch {
      return null
    }
  })

  // 주문서의 상품 목록은 장바구니에서 넘어온 스냅샷일 뿐이라, 여기서 수량을 줄이거나
  // 빼도 장바구니 원본에는 영향이 없다 — 결제 성공 시 장바구니에서는 어차피 id 기준으로
  // 통째로 지우지(수량만큼 빼는 게 아니라) 때문에 애초에 수량을 맞춰둘 필요가 없다.
  const persistItems = (next: CartItem[]) => {
    try {
      sessionStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(next))
    } catch {
      // 저장 공간이 없어도 화면 상의 수정 자체는 계속 가능해야 하므로 무시한다.
    }
  }

  const handleItemQuantityChange = (id: string, quantity: number) => {
    setItems((prev) => {
      if (!prev) return prev
      const next = prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      persistItems(next)
      return next
    })
  }

  const handleItemRemove = (id: string) => {
    setItems((prev) => {
      if (!prev) return prev
      const next = prev.filter((item) => item.id !== id)
      persistItems(next)
      return next
    })
  }

  const hasSavedShipping = Boolean(user?.shippingName && user?.shippingPhone && user?.shippingAddress)

  const [agreed, setAgreed] = useState(false)
  const [isEditingShipping, setIsEditingShipping] = useState(!hasSavedShipping)
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    shippingName: user?.shippingName ?? '',
    shippingPhone: user?.shippingPhone ?? '',
    shippingAddress: user?.shippingAddress ?? '',
    shippingAddressDetail: user?.shippingAddressDetail ?? '',
  })
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [deliveryRequestPreset, setDeliveryRequestPreset] = useState('')
  const [deliveryRequestCustom, setDeliveryRequestCustom] = useState('')
  const handleSearchAddress = useDaumPostcodeSearch((roadAddress) => {
    setShippingForm((prev) => ({ ...prev, shippingAddress: roadAddress }))
  })

  // 새로고침해도 결제 정보가 날아가지 않도록, 넘어온 상품 목록을 탭 안에 붙잡아둔다.
  useEffect(() => {
    if (stateItems && stateItems.length > 0) {
      try {
        sessionStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(stateItems))
      } catch {
        // 저장 공간이 없어도 결제 자체는 계속 진행 가능해야 하므로 무시한다.
      }
    }
  }, [stateItems])

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items, navigate])

  if (!items || items.length === 0) {
    return null
  }

  const productTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalPrice = productTotal + SHIPPING_FEE

  const shippingErrors = attemptedSubmit ? validateShipping(shippingForm) : {}

  const finalDeliveryRequest =
    deliveryRequestPreset === '직접 입력' ? deliveryRequestCustom.trim() : deliveryRequestPreset

  const handleShippingChange =
    (field: keyof ShippingForm) => (e: ChangeEvent<HTMLInputElement>) => {
      setShippingForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleCheckout = async () => {
    setCheckoutError(null)

    const errors = validateShipping(shippingForm)
    if (Object.keys(errors).length > 0) {
      setAttemptedSubmit(true)
      setIsEditingShipping(true)
      setCheckoutError('배송지 정보를 확인해주세요.')
      return
    }

    setSubmitting(true)

    const orderId = await addOrder(user!.email, items, SHIPPING_FEE, {
      shippingName: shippingForm.shippingName,
      shippingPhone: shippingForm.shippingPhone,
      shippingAddress: shippingForm.shippingAddress,
      shippingAddressDetail: shippingForm.shippingAddressDetail || undefined,
      deliveryRequest: finalDeliveryRequest || undefined,
    })

    setSubmitting(false)

    if (!orderId) {
      setCheckoutError('주문 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (saveAsDefault) {
      updateProfile(shippingForm)
    }
    removeItems(items.map((item) => item.id))
    try {
      sessionStorage.removeItem(CHECKOUT_ITEMS_KEY)
    } catch {
      // no-op
    }
    navigate('/order/complete', {
      replace: true,
      state: {
        orderId,
        itemCount: items.length,
        totalPrice,
        items,
        shippingName: shippingForm.shippingName,
        shippingAddress: shippingForm.shippingAddress,
        shippingAddressDetail: shippingForm.shippingAddressDetail || undefined,
      },
    })
  }

  return (
    <div>
      <Helmet>
        <title>NOVERA | 주문/결제</title>
      </Helmet>

      <div className="px-20 pb-16 pt-32 md:px-32 lg:px-40 lg:pb-24 lg:pt-48">
        <h1 className="text-h2">주문/결제</h1>
      </div>

      <div className="flex flex-col gap-32 px-20 pb-32 md:px-32 lg:flex-row lg:items-start lg:gap-64 lg:px-40 lg:pb-80">
        <div className="flex min-w-0 flex-1 flex-col gap-48">
          <div className="flex flex-col gap-16">
            <div className="flex items-center justify-between">
              <p className="text-body-lg font-bold text-primary">배송지</p>
              {hasSavedShipping || !isEditingShipping ? (
                <button
                  type="button"
                  className="text-body-sm cursor-pointer border-none bg-transparent text-secondary underline"
                  onClick={() => setIsEditingShipping((prev) => !prev)}
                >
                  {isEditingShipping ? '완료' : '변경'}
                </button>
              ) : null}
            </div>

            {isEditingShipping ? (
              <div className="flex flex-col gap-12 border border-line px-20 py-16">
                <Input
                  id="order-shipping-name"
                  label="수령인"
                  value={shippingForm.shippingName}
                  onChange={handleShippingChange('shippingName')}
                  error={shippingErrors.shippingName}
                />
                <Input
                  id="order-shipping-phone"
                  label="연락처"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={shippingForm.shippingPhone}
                  onChange={handleShippingChange('shippingPhone')}
                  error={shippingErrors.shippingPhone}
                />
                <div className="flex flex-col gap-8">
                  <label className="text-caption text-secondary" htmlFor="order-shipping-address">
                    주소
                  </label>
                  <div className="flex gap-8">
                    <Input
                      id="order-shipping-address"
                      value={shippingForm.shippingAddress}
                      readOnly
                      placeholder="주소 검색을 눌러주세요"
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" onClick={handleSearchAddress} className="shrink-0">
                      주소 검색
                    </Button>
                  </div>
                  {shippingErrors.shippingAddress && (
                    <p className="text-caption text-danger">{shippingErrors.shippingAddress}</p>
                  )}
                </div>
                <Input
                  id="order-shipping-address-detail"
                  label="상세주소"
                  placeholder="동/호수 등 상세주소를 입력해주세요"
                  value={shippingForm.shippingAddressDetail}
                  onChange={handleShippingChange('shippingAddressDetail')}
                />
                <Checkbox
                  id="order-save-default"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  label="이 배송지를 기본 배송지로 저장"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6 border border-line px-20 py-16">
                <p className="text-sm font-medium text-primary">{shippingForm.shippingName}</p>
                <p className="text-body-sm text-secondary">{shippingForm.shippingPhone}</p>
                <p className="text-body-sm text-secondary">
                  {shippingForm.shippingAddress} {shippingForm.shippingAddressDetail}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-16">
            <p className="text-body-lg font-bold text-primary">배송 요청사항</p>
            <div className="flex flex-col gap-12">
              <div className="relative">
                <select
                  value={deliveryRequestPreset}
                  onChange={(e) => setDeliveryRequestPreset(e.target.value)}
                  className="text-sm w-full appearance-none rounded-sm border border-line bg-surface py-12 pl-16 pr-40 text-primary outline-none focus:border-primary"
                >
                  <option value="">선택 안 함</option>
                  {DELIVERY_REQUEST_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 text-secondary"
                />
              </div>
              {deliveryRequestPreset === '직접 입력' && (
                <Input
                  id="order-delivery-request-custom"
                  placeholder="배송 요청사항을 입력해주세요"
                  value={deliveryRequestCustom}
                  onChange={(e) => setDeliveryRequestCustom(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-16">
            <p className="text-body-lg font-bold text-primary">주문상품</p>
            <div>
              {items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={{ ...item, price: formatPrice(item.price) }}
                  onQuantityChange={(quantity) => handleItemQuantityChange(item.id, quantity)}
                  onRemove={() => handleItemRemove(item.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-20 bg-surface-muted px-24 pb-24 pt-20 lg:w-360">
          <p className="text-[15px] font-medium text-primary">결제 금액</p>
          <div className="text-body-sm flex items-center justify-between text-primary">
            <span className="text-secondary">상품금액</span>
            <span>{formatPrice(productTotal)}</span>
          </div>
          <div className="text-body-sm flex items-center justify-between text-primary">
            <span className="text-secondary">배송비</span>
            <span>{formatPrice(SHIPPING_FEE)}</span>
          </div>
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between text-primary">
            <span className="text-[15px] font-medium">총 결제금액</span>
            <span className="text-price">{formatPrice(totalPrice)}</span>
          </div>
          <Checkbox
            id="order-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            label="주문내용 확인 및 결제진행에 동의"
          />
          {checkoutError && <p className="text-body-sm text-danger">{checkoutError}</p>}
          <Button
            variant="primary"
            size="large"
            className="w-full"
            disabled={!agreed || submitting}
            onClick={handleCheckout}
          >
            {submitting ? '처리 중...' : '결제하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Order
