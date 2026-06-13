import './Orders.css'
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiArrowRight } from "react-icons/fi";
import Loader from "../../components/common/Loader/Loader";
import { fetchMyOrdersThunk } from "../../features/orders/orderThunk";

const FILTERS = ["all", "pending", "processing", "packed", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders = [], loading } = useSelector((state) => state.orders);

  const [filter, setFilter] = useState("all");
  const safeImage = (img) => (img && img.trim() !== "" ? img : "/placeholder.png");

  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchMyOrdersThunk());
    }
  }, [dispatch, orders.length]);

  if (loading) return <Loader />;

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus === filter;
  });

  const getStatusClass = (status) => (status ? status.toLowerCase() : "pending");

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p className="orders-subtitle">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed so far
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="orders-filter">
        {FILTERS.map((status) => (
          <button
            key={status}
            className={`filter-pill ${filter === status ? "active-filter" : ""}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">
            <FiPackage size={36} />
          </div>
          <h3>No orders found</h3>
          <p>
            {filter === "all"
              ? "Start shopping to see your orders here."
              : `You don't have any ${filter} orders right now.`}
          </p>
          <button className="browse-btn" onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const extraItems = (order.orderItems?.length || 0) - 4;

            return (
              <div key={order._id} className="order-card">
                {/* PRODUCT IMAGES */}
                <div className="order-images">
                  {order.orderItems?.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={safeImage(item.productImage)}
                      alt={item.productTitle}
                      className="order-img"
                    />
                  ))}
                  {extraItems > 0 && (
                    <div className="order-img-more">+{extraItems} more</div>
                  )}
                </div>

                {/* ORDER ID + DATE */}
                <div className="order-meta">
                  <h3 className="order-id">Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>

                {/* STATUS + AMOUNT */}
                <div className="order_summary">
                  <span className={`badge status-${getStatusClass(order.orderStatus)}`}>
                    <span className="badge-dot" />
                    {order.orderStatus}
                  </span>
                  <span className={`badge payment-${getStatusClass(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="order-amount">₹{order.totalAmount}</span>
                </div>

                {/* TRACK BUTTON */}
                <button
                  className="track-btn"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  Track Order
                  <FiArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;