import "./Checkout.css";

const Checkout = () => {
  return (
    <div className="checkout-page">
      <div className="shipping-form">
        <h2>
          Shipping Address
        </h2>
        <input
          type="text"
          placeholder="Full Name"
        />
        <input
          type="text"
          placeholder="Phone Number"
        />
        <textarea
          placeholder="Address"
        />
        <input
          type="text"
          placeholder="City"
        />
        <input
          type="text"
          placeholder="Pincode"
        />
      </div>
      <div className="checkout-summary">
        <h2>
          Order Summary
        </h2>
        <div>
          Total: ₹7147
        </div>
        <button>
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default Checkout;