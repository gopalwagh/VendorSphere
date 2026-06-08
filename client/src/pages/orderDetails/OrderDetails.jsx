import "./OrderDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axios";
import Loader from "../../components/common/Loader/Loader";
import { getOrderDetailsApi } from "../../api/orderApi";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order,setOrder] = useState(null);

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

  },[orderId]);

  if (!order) return < Loader />;

  return (
    <div  className="order-details-page">

      <div className="order-header">
        <h1>Order Details</h1>
      </div>

      <div className="order-content">
        {/* Left Side order=>or_*/}
        <div className="or_products-section">

          <h2>Products</h2>

          {order.orderItems.map((item) => (
            <div
              key={item._id}
              className="or_product-card"
            >
              <img
                src={item.product.images?.[0]?.url}
                alt=""
              />

              <div className="or_product-info">
                <h3>{item.product.title}</h3>

                <p>Quantity: {item.quantity}</p>

                <p>₹{item.price}</p>
              </div>
            </div>
          ))}

        </div>

        {/* Right Side */}
        <div className="order-summary">

          <div className="summary-card">
            <h3>Order Status</h3>
            <span className="status-badge">
              {order.orderStatus}
            </span>
          </div>

          <div className="summary-card">
            <h3>Payment</h3>
            <span className="payment-badge">
              {order.paymentStatus}
            </span>
          </div>

          <div className="summary-card">
            <h3>Total Amount</h3>
            <h2>₹{order.totalAmount}</h2>
          </div>

          <div className="summary-card">
            <h3>Timeline</h3>

            {order.orderTimeline.map((step,index)=>(
              <div
                key={index}
                className="timeline-item"
              >
                <div className="dot"></div>

                <div>
                  <strong>{step.status}</strong>

                  <p>{step.message}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
