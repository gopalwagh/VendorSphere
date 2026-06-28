import "./Checkout.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { checkoutThunk, verifyPaymentThunk } from "../../features/orders/orderThunk";
import { clearCart } from "../../features/cart/cartSlice";
import { clearCoupon } from "../../features/coupon/couponSlice";
import { useSelector, useDispatch } from "react-redux";
import { applyCouponThunk } from "../../features/coupon/couponThunk";
import { useEffect, useState } from "react";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, subtotal } = useSelector((state) => state.cart);
  const { coupon } = useSelector((state) => state.coupon);
  const storedCoupon = sessionStorage.getItem("couponCode") || "";

  useEffect(() => {
    if (storedCoupon) {
      dispatch(applyCouponThunk(storedCoupon));
    }
  }, [dispatch, storedCoupon]);

  useEffect(() => {
    if (!cartItems.length) {
      navigate("/cart");
    }
  }, [cartItems.length, navigate]);

  const discountAmount = coupon?.discountAmount ?? 0;
  const shipping = coupon?.shipping ?? (cartItems.length > 0 ? 100 : 0);
  const tax = parseFloat((coupon?.tax ?? subtotal * 0.05).toFixed(0));
  const grandTotal = coupon?.grandTotal ?? subtotal + shipping + tax;

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAddress = () => {
    if (address.fullName.trim().length === 0) {
      toast.error("Full name is required");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Phone number must be 10 digits");
      return false;
    }
    if (address.addressLine1.trim().length === 0) {
      toast.error("Address line 1 is required");
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
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!validateAddress()) return;

    if (!window.Razorpay) {
      toast.error("Payment gateway is loading. Please try again.");
      return;
    }

    setIsProcessing(true);

    const result = await dispatch(
      checkoutThunk({
        couponCode: storedCoupon,
        shippingAddress: address,
      })
    );

    if (!result.success) {
      toast.error(result.message);
      setIsProcessing(false);
      return;
    }

    const { razorpayOrder } = result.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      name: "VendorSphere",
      description: "Order Payment",
      handler: async function (response) {
        if (
          !response.razorpay_order_id ||
          !response.razorpay_payment_id ||
          !response.razorpay_signature
        ) {
          toast.error("Payment failed - invalid response");
          setIsProcessing(false);
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
          sessionStorage.removeItem("couponCode");

          toast.success("Payment successful");
          setIsProcessing(false);
          navigate("/orders");
        } else {
          setIsProcessing(false);
          toast.error(verifyResult.message);
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <form className="checkout-container" onSubmit={handleCheckout}>
      <div className="checkout-left">
        <h2>Delivery Address</h2>

        <div className="address-form">
          <input
            placeholder="Full Name"
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          />
          <input
            placeholder="Phone Number"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
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
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          />
          <input
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          />
        </div>

        <button className="place-order-btn" type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>

      <div className="checkout-right">
        <h2>Order Summary</h2>
        <div className="items-list">
          {cartItems
            .filter((item) => item.product)
            .map((item) => (
              <div className="item-row" key={item.product._id}>
                <img
                  src={item.product.images?.[0]?.url}
                  alt={item.product.title}
                />
                <div className="item-info">
                  <p className="title">{item.product.title}</p>
                  <p className="price">
                    {item.quantity} x Rs. {item.product.price}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <hr />
        <div className="summary-box">
          <div className="row">
            <span>Subtotal</span>
            <span>Rs. {subtotal}</span>
          </div>
          <div className="row">
            <span>Shipping</span>
            <span>Rs. {shipping}</span>
          </div>
          <div className="row">
            <span>Tax</span>
            <span>Rs. {tax}</span>
          </div>
          <div className="row">
            <span>Discount</span>
            <span>- Rs. {discountAmount}</span>
          </div>
          <hr />

          <div className="total-row">
            <span>Total</span>
            <span>Rs. {grandTotal}</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Checkout;
