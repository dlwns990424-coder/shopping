interface OrderItemRowItem {
  name: string
  option: string
  price: string
  quantity: number
  image?: string | null
}

interface OrderItemRowProps {
  item: OrderItemRowItem
}

function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <div className="flex items-center gap-24 py-16">
      <div
        className="h-96 w-80 shrink-0 rounded-sm bg-line bg-cover bg-center"
        style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
      />
      <div className="flex flex-1 flex-col gap-8">
        <p className="text-body-lg">{item.name}</p>
        <p className="text-body-sm text-secondary">{item.option}</p>
        <p className="text-price">{item.price}</p>
      </div>
      <span className="text-body text-secondary">{item.quantity}개</span>
    </div>
  )
}

export default OrderItemRow
