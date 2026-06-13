import "./Checkout.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { checkoutThunk,verifyPaymentThunk } from "../../features/orders/orderThunk";
import { clearCart } from "../../features/cart/cartSlice";
import { clearCoupon } from "../../features/coupon/couponSlice";
import { getCartThunk } from "../../features/cart/cartThunk";
import { useSelector, useDispatch } from "react-redux";
import { applyCouponThunk } from "../../features/coupon/couponThunk";
import { useEffect, useState } from "react";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, subtotal } = useSelector((state) => state.cart);

  const { coupon } = useSelector((state)=> state.coupon);
  const storedCoupon = sessionStorage.getItem("couponCode") || 0;

  useEffect(() => {
    if(storedCoupon){
      dispatch(
        applyCouponThunk(storedCoupon)
      );
    }
  }, [dispatch, storedCoupon]);

  const discountPercent = coupon?.discountPercent ?? 0;
  const discountAmount = coupon?.discountAmount ?? 0;
  const shipping = coupon?.shipping ?? (cartItems.length > 0 ? 100 : 0);
  const tax = parseFloat((coupon?.tax ?? (subtotal * 0.05)).toFixed(0));
  const grandTotal = coupon?.grandTotal ?? (subtotal + shipping + tax);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // form validation first
    if (address.fullName.trim().length === 0){
      toast.error("Full Name is required !!");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Phone Number must be 10 digits");
      return false;
    }
    if (address.addressLine1.trim().length === 0) {
      toast.error("Address Line 1 is required");
      return false;
    }
    if (address.city.trim().length === 0) {
      toast.error("City is required");
      return false;
    }
    if (address.state.trim().length === 0) {
      toast.error("State is required");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Pincode must be 6 digits");
      return false;
    }
    return true;
  }

  const handleCheckout = async () => {
    // pehle form validation
    const isValid = handleSubmit({ preventDefault: () => {} }); 
    if (!isValid) return;

    const result = await dispatch(checkoutThunk({couponCode: storedCoupon,
      shippingAddress: address,
    }));

    if(!result.success){
      toast.error(result.message);
      return;
    }
    const { razorpayOrder } = result.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      
      name: "ShopHub",
      description: "Order Payment",

      handler: async function (response) {
        console.log("RAZORPAY RESPONSE:", response);

        if (
          !response.razorpay_order_id ||
          !response.razorpay_payment_id ||
          !response.razorpay_signature
        ) {
          toast.error("Payment failed - invalid response");
          return;
        }

        const verifyResult = await dispatch(
          verifyPaymentThunk({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        );

        if (verifyResult.success) {
          dispatch(clearCart());
          dispatch(clearCoupon());
          await dispatch(getCartThunk());

          sessionStorage.removeItem("couponCode");

          toast.success("Payment Successful");
          navigate("/orders");
        } else {
          toast.error(verifyResult.message);
        }
      }
    };
    const razorpay = new window.Razorpay( options );
    razorpay.open();
  };

  return (
    <div 
      className="checkout-container"
      onSubmit={ handleSubmit }
    >
      {/* LEFT SIDE - ADDRESS */}
      <div className="checkout-left">
        <h2>Delivery Address</h2>

        <div className="address-form">
          <input
            placeholder="Full Name"
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />
          <input
            placeholder="Phone Number"
            value={address.phoneNumber}
            onChange={(e) =>
              setAddress({ ...address, phone: e.target.value })
            }
          />
          <input
            placeholder="Address Line 1"
            value={address.addressLine1}
            onChange={(e) =>
              setAddress({ ...address, addressLine1: e.target.value })
            }
          />
          <input
            placeholder="City"
            value={address.city}
            onChange={(e) =>
              setAddress({ ...address, city: e.target.value })
            }
          />
          <input
            placeholder="State"
            value={address.state}
            onChange={(e) =>
              setAddress({ ...address, state: e.target.value })
            }
          />
          <input
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) =>
              setAddress({ ...address, pincode: e.target.value })
            }
          />
          
        </div>
        <button 
          className="place-order-btn"
          onClick={ handleCheckout }
        > Pay Now
        </button>
      </div>

      {/* RIGHT SIDE - ORDER SUMMARY */}
      <div className="checkout-right">
        <h2>Order Summary</h2>
        {/* ITEMS */}
        <div className="items-list">
          {cartItems.filter((item) => item.product).map((item) => (
            <div className="item-row" key={item.product._id}>
              <img
                src={item.product.images?.[0]?.url}
                alt={item.product.title}
              />
              <div className="item-info">
                <p className="title">{item.product.title}</p>
                <p className="price">
                  {item.quantity} × ₹{item.product.price}
                </p>
              </div>

            </div>
          ))}
        </div>

        <hr />
        {/* SUMMARY */}
        <div className="summary-box">
          <div className="row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="row">
            <span>Shipping</span>
            <span>₹{shipping}</span>
          </div>
          <div className="row">
            <span>Tax</span>
            <span>₹{tax}</span>
          </div>
          <div className="row">
            <span>Discount</span>
            <span>-₹{discountAmount}</span>
          </div>
          <hr />

          <div className="total-row">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;