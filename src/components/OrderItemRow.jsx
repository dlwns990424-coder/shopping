import './OrderItemRow.css'

function OrderItemRow({ item }) {
  return (
    <div className="order-item-row">
      <div
        className="order-item-row__thumbnail"
        style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
      />
      <div className="order-item-row__info">
        <p className="order-item-row__name text-body-lg">{item.name}</p>
        <p className="order-item-row__option text-body-sm">{item.option}</p>
        <p className="order-item-row__price text-price">{item.price}</p>
      </div>
      <span className="order-item-row__quantity text-body">{item.quantity}개</span>
    </div>
  )
}

export default OrderItemRow
