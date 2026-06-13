import "./ManageOrders.css";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/common/Loader/Loader";
import { fetchAllOrdersThunk,updateOrderStatusThunk, fetchAdminOrdersThunk } from "../../../features/orders/orderThunk";

const ManageOrders = () => {
  const dispatch = useDispatch();
  
  const { adminOrders, loading} = useSelector((state) => state.orders);

  console.log(adminOrders[0]);
  useEffect(() => {
    if(!adminOrders){
      dispatch(fetchAdminOrdersThunk());
    }
  }, [dispatch,adminOrders])

  if (loading) return < Loader />

  const handleStatusUpdate = async( orderId, status) => {
    const result = await dispatch(updateOrderStatusThunk( orderId,status ));

    if (result.status) {
      toast.success("Order Updated");
      dispatch(fetchAdminOrdersThunk());
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="manage-orders">
      <h1>Manage Orders</h1>
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
            {adminOrders?.map((order) => (
              <tr key={order._id}>
                <td>
                  #{order._id.slice(-6)}
                </td>
                <td> {order.customer?.name} </td>
                <td> ₹{order.sellerRevenue} </td>
                <td> ₹{order.sellerEarnings} </td>
                <td> {
                  order.paymentStatus === "paid" ? (
                    <span style={{ color: "green", fontWeight: "600" }}>Paid</span>
                  ) : (
                    <span style={{ color: "red", fontWeight: "600" }}>Unpaid</span>
                  )}               
                </td>
                <td>
                  <select
                    value={order.orderItems?.[0]?.itemStatus}
                    onChange={(e)=>
                      handleStatusUpdate(
                        order._id,e.target.value
                      )
                    }
                  >
                    <option value="processing">
                      Processing
                    </option>
                    <option value="packed">
                      Packed
                    </option>
                    <option value="shipped">
                      Shipped
                    </option>
                    <option value="out_for_delivery">
                      Out For Delivery
                    </option>
                    <option value="delivered">
                      Delivered
                    </option>
                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </td>
                <td>
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ManageOrders;