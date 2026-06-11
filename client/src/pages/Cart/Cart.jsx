import "./Cart.css";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateCartThunk, removeCartThunk, getCartThunk } from "../../features/cart/cartThunk";
import { applyCouponThunk, } from "../../features/coupon/couponThunk"; 
import { clearCoupon } from "../../features/coupon/couponSlice";
import { checkoutThunk, verifyPaymentThunk } from "../../features/orders/orderThunk";
import { clearCart } from "../../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, } = useSelector(
    (state) => state.cart
  );
  const { coupon } = useSelector((state)=> state.coupon); 

  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const tax = coupon?.tax ?? subtotal * 0.05;
  const shipping = coupon?.shipping ?? (cartItems.length > 0 ? 100 : 0);
  const total = subtotal + shipping + tax;
  const resetCoupon = () => {
    dispatch(clearCoupon());
    setAppliedCoupon("");
    setCouponCode("");
    toast("Cart updated. Reapply coupon.", { icon: "🔄" });
  };

  const increasQuantity = async(item) => {
    if(item.quantity >= item.product.stock) {
      toast.error("Maximum stock reached");
      return;
    }
    await dispatch(updateCartThunk(item.product._id, item.quantity +1 ));
    
    resetCoupon();
  };

  const decreaseQuantity = async(item) => {
    if(item.quantity <= 1){
      return;
    }
    await dispatch(updateCartThunk(item.product._id, item.quantity -1));
    
    resetCoupon();
  }

  const handleRemove = async(productId) => {
    await dispatch(removeCartThunk(productId));

    resetCoupon();
    toast.success("Removed From Cart");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter coupon code");
      return;
    }
    if(appliedCoupon === couponCode){
      return toast("Coupon Code Already Applied",{
        icon: "⚠️",
        style: {
          border: "1px solid #facc15",
          padding: "10px",
          color: "#1a1a1a",
        }
      });
      ;
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
        <h1> Shopping Cart </h1>
        {
          cartItems.length === 0 ? ( 
            <div className="empty-cart">
              <div className="empty-box">
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything yet.</p>

                <button
                  onClick={() => navigate("/products")}
                  className="shop-btn">
                  OK, Go Shopping
                </button>
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
                <div
                  key={ item.product._id }
                  className="cart-item"
                >
                  <img
                    src={item.product.images?.[0]?.url}
                    alt={item.product.title}
                  />
                  <div className="item-info">
                    <h3>{ item.product.title } </h3>
                    <p>₹{ item.product.price } </p>
                    <p> Stock:{ item.product.stock } </p>
                  </div>
                  <div className="quantity">
                    <button onClick={() => decreaseQuantity(item)}
                    >
                      -
                    </button>
                    <span> { item.quantity }</span>
                    <button onClick={()=> increasQuantity(item)}
                    >
                      +
                    </button>
                  </div>

                  <button className="remove-btn"
                  onClick={()=> handleRemove(item.product._id )}
                  >
                    Remove
                  </button>

                </div>
              )
            )
          )
        }
      </div>

      <div className="cart-summary">
        <h2> Order Summary</h2>
        <div className="summary-row">
          <span> Items </span>
          <span> {totalItems} </span>
        </div>

        <div className="summary-row">
          <span> Subtotal </span>
          <span> ₹{subtotal} </span>
        </div>

        <div className="summary-row">
          <span> Shipping </span>
          <span> 
            ₹{ shipping } 
          </span>
        </div>

        <div className="summary-row" >
          <span> Tax </span>
          <span> ₹{ tax } </span>
        </div>
        {/* Coupon box yaha shift karo */}
        <div className="coupon-box">
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button 
            onClick={ handleApplyCoupon }
            disabled={ appliedCoupon === couponCode
          } >
          { appliedCoupon === couponCode ? "Applied" : "Apply" }
          </button>
        </div>
        { coupon && (
          <>
            <div className="summary-row">
              <span> Discount </span>
              <span>- ₹{coupon.discountAmount}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span> Final Price </span>
              <span> ₹{ coupon.grandTotal } </span>
            </div>
          </>
        )}

        { !coupon && (
          <div className="summary-row total">
            <span> Total </span>
            <span> ₹{ total } </span>
          </div>
        )} 

        <button
          className="checkout-btn"
          disabled={ cartItems.length === 0 }
          onClick={() => {
            sessionStorage.setItem("couponCode", appliedCoupon || "");
            navigate("/checkout")
          }}

        >
          Proceed To Checkout
        </button>

      </div>

    </div>
  );
};

export default Cart;