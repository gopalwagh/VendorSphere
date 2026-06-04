import './Cart.css';

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 2999,
      quantity: 1,
      image: "https://picsum.photos/200",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 1999,
      quantity: 2,
      image: "https://picsum.photos/201",
    },
  ];

  return (
    <div className='cart-page'>
      <div className="cart-items">
        <h1>Shopping Cart</h1>
        { cartItems.map((item) => (
          <div
            key={item.id}
            className='cart-item'
          >
            <img
              src={item.image}
              alt={item.name}
            />
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
            </div>
            <div className="quantity">
              <button>-</button>
              <span>
                {item.quantity}
              </span>
              <button>+</button>
            </div>
            <button className="remove-btn">
              Remove
            </button>
          </div>
        ))};
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹6997</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>₹100</span>
        </div>
        <div className="summary-row">
          <span>Tax</span>
          <span>₹50</span>
        </div>
        <hr />
        <div className="summary-row total">
          <span>Total</span>
          <span>₹7147</span>
        </div>
        <button className="checkout-btn">
          Proceed To Checkout
        </button>
      </div>
      
    </div>
  );
};

export default Cart;