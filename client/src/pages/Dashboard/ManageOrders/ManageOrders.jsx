import "./ManageOrders.css";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/Loader/Loader";
import { updateOrderStatusThunk, fetchAdminOrdersThunk } from "../../../features/orders/orderThunk";

const ManageOrders = () => {
  const dispatch = useDispatch();
  const { adminOrders = [], loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (!adminOrders.length) {
      dispatch(fetchAdminOrdersThunk());
    }
  }, [dispatch, adminOrders.length]);

  if (loading) return <Loader />;

  const handleStatusUpdate = async (orderId, status) => {
    const result = await dispatch(updateOrderStatusThunk(orderId, status));

    if (result.status) {
      toast.success("Order updated");
      dispatch(fetchAdminOrdersThunk());
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="manage-orders">
      <div className="page-header">
        <div>
          <p className="eyebrow">Seller orders</p>
          <h1>Manage Orders</h1>
        </div>
      </div>

      {!adminOrders.length ? (
        <div className="empty-manage-state">No seller orders found yet.</div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Earning</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {adminOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.customer?.name}</td>
                  <td>Rs. {order.sellerRevenue}</td>
                  <td>Rs. {order.sellerEarnings}</td>
                  <td>
                    <span
                      className={`payment-badge ${order.paymentStatus === "paid" ? "paid" : "pending"}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.orderItems?.[0]?.itemStatus}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    >
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out For Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
