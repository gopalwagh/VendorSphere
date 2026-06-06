import './Coupons.css';

const Coupons = () => {
  return (
    <div className="coupons-page">
      <div className="coupon-header">
        <h1>Coupons</h1>
        <button>
          Create Coupon
        </button>
      </div>

      <div className="coupon-list">
        <div className="coupon-card">
          <h3>SUMMER20</h3>
          <p>20% OFF</p>
        </div>
        <div className="coupon-card">
          <h3>WELCOME10</h3>
          <p>10% OFF</p>
        </div>
      </div>
      
    </div>
  )
}

export default Coupons;