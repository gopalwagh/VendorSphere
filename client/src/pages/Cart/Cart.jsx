import "./Cart.css";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateCartThunk, removeCartThunk, getCartThunk } from "../../features/cart/cartThunk";
import { applyCouponThunk } from "../../features/coupon/couponThunk";
import { clearCoupon } from "../../features/coupon/couponSlice";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems } = useSelector((state) => state.cart);
  const { coupon } = useSelector((state) => state.coupon);

  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const visibleItems = useMemo(
    () => cartItems.filter((item) => item.product),
    [cartItems]
  );

  useEffect(() => {
    if (cartItems.some((item) => !item.product)) {
      dispatch(getCartThunk());
    }
  }, [cartItems, dispatch]);

  const tax = parseFloat((coupon?.tax ?? subtotal * 0.05).toFixed(2));
  const shipping = coupon?.shipping ?? (visibleItems.length > 0 ? 100 : 0);
  const total = coupon?.grandTotal ?? subtotal + shipping + tax;

  const resetCoupon = () => {
    dispatch(clearCoupon());
    setAppliedCoupon("");
    setCouponCode("");
    sessionStorage.removeItem("couponCode");
    toast("Cart updated. Reapply coupon.");
  };

  const increasQuantity = async (item) => {
    if (item.quantity >= item.product.stock) {
      toast.error("Maximum stock reached");
      return;
    }

    const result = await dispatch(
      updateCartThunk(item.product._id, item.quantity + 1)
    );

    if (result.success) {
      resetCoupon();
    } else {
      toast.error(result.message);
    }
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity <= 1) {
      return;
    }

    const result = await dispatch(
      updateCartThunk(item.product._id, item.quantity - 1)
    );

    if (result.success) {
      resetCoupon();
    } else {
      toast.error(result.message);
    }
  };

  const handleRemove = async (productId) => {
    const result = await dispatch(removeCartThunk(productId));

    if (result.success) {
      resetCoupon();
      toast.success("Removed From Cart");
    } else {
      toast.error(result.message);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter coupon code");
      return;
    }

    if (appliedCoupon === couponCode) {
      return toast("Coupon code already applied");
    }

    const result = await dispatch(applyCouponThunk(couponCode));
    if (result.success) {
      setAppliedCoupon(couponCode);
      toast.success("Coupon Applied");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-items">
        <h1>Shopping Cart</h1>
        {cartItems.length !== visibleItems.length && (
          <div className="cart-notice">
            One or more products were removed by the seller. We refreshed your cart.
          </div>
        )}

        {visibleItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-box">
              <h2>Your cart is empty</h2>
              <p>Looks like you have not added anything yet.</p>

              <button onClick={() => navigate("/products")} className="shop-btn">
                OK, Go Shopping
              </button>
            </div>
          </div>
        ) : (
          visibleItems.map((item) => (
            <div key={item.product._id} className="cart-item">
              <img src={item.product.images?.[0]?.url} alt={item.product.title} />
              <div className="item-info">
                <h3>{item.product.title}</h3>
                <p>Rs. {item.product.price}</p>
                <p>Stock: {item.product.stock}</p>
              </div>
              <div className="quantity">
                <button onClick={() => decreaseQuantity(item)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increasQuantity(item)}>+</button>
              </div>
              <button className="remove-btn" onClick={() => handleRemove(item.product._id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Items</span>
          <span>{totalItems}</span>
        </div>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal}</span>
        </div>

        <div className="summary-row">
          <span>Shipping</span>
          <span>Rs. {shipping}</span>
        </div>

        <div className="summary-row">
          <span>Tax</span>
          <span>Rs. {tax}</span>
        </div>

        <div className="coupon-box">
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button onClick={handleApplyCoupon} disabled={appliedCoupon === couponCode}>
            {appliedCoupon === couponCode ? "Applied" : "Apply"}
          </button>
        </div>

        {coupon ? (
          <>
            <div className="summary-row">
              <span>Discount</span>
              <span>- Rs. {coupon.discountAmount}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Final Price</span>
              <span>Rs. {coupon.grandTotal}</span>
            </div>
          </>
        ) : (
          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {total}</span>
          </div>
        )}

        <button
          className="checkout-btn"
          disabled={visibleItems.length === 0}
          onClick={() => {
            sessionStorage.setItem("couponCode", appliedCoupon || "");
            navigate("/checkout");
          }}
        >
          Proceed To Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
