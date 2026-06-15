import "./OrderDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { getOrderDetailsApi } from "../../api/orderApi";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderDetailsApi(orderId);
        setOrder(res.data.order);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <Loader />;

  return (
    <div className="order-details-page">
      <div className="order-hero">
        <div>
          <h1>Order #{order._id.slice(-6)}</h1>
          <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="hero-right">
          <span className={`status-chip ${order.orderStatus}`}>{order.orderStatus}</span>
          <span className={`payment-chip ${order.paymentStatus}`}>{order.paymentStatus}</span>
        </div>
      </div>

      <div className="order-layout">
        <div className="left-section">
          <div className="section-card">
            <h2>Products</h2>
            <div className="products-grid">
              {order.orderItems.map((item) => (
                <div key={item._id} className="product_card">
                  <img
                    src={item.product?.images?.[0]?.url || item.productImage}
                    alt={item.productTitle}
                  />
                  <div className="product-info">
                    <h3>{item.productTitle}</h3>
                    <p>Qty: {item.quantity}</p>
                    <p>Rs. {item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card shipping-card">
            <h2>Shipping Address</h2>
            <div className="address-box">
              <div className="address-header">
                <h3>{order.shippingAddress?.fullName}</h3>
                <span className="phone-badge">{order.shippingAddress?.phone}</span>
              </div>
              <p className="address-line">{order.shippingAddress?.addressLine1}</p>
              <p className="address-line">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p className="address-line">{order.shippingAddress?.pincode}</p>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="section-card">
            <h2>Order Timeline</h2>
            {order.orderTimeline.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>{step.status}</strong>
                  <p>{step.message}</p>
                  <small>{new Date(step.updatedAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <h2>Payment Summary</h2>
            <div className="price-row">
              <span>Subtotal</span>
              <span>Rs. {order.subtotal}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span>Rs. {order.shipping}</span>
            </div>
            <div className="price-row">
              <span>Tax</span>
              <span>Rs. {order.tax}</span>
            </div>
            <div className="price-row">
              <span>Discount</span>
              <span>- Rs. {order.discountAmount}</span>
            </div>
            <hr />
            <div className="price-row total-row">
              <span>Total</span>
              <span>Rs. {order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
