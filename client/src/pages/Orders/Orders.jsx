import "./Orders.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrdersThunk } from "../../features/orders/orderThunk";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader/Loader";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  const  { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrdersThunk());
  },[dispatch]);

  if(loading) return <Loader/>;
  
  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <h3>No Orders Found</h3>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="order-card"
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            <div>
              <h3>Order ID: {order._id}</h3>
              <p className={`order-status status-${order.orderStatus}`}>
                Status: {order.orderStatus}
              </p>
              <p className={`order-status status-${order.orderStatus}`}>
                Payment: {order.paymentStatus}
              </p>
              <p className={`order-status status-${order.orderStatus}`}>
                Total: ₹{order.totalAmount}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;