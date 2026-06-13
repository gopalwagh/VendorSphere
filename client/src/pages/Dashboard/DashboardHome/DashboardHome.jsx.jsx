import "./DashboardHome.css";
import Loader from "../../../components/common/Loader/Loader";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";;
import { fetchAdminOrdersThunk } from "../../../features/orders/orderThunk";
import { fetchAdminProductsThunk } from "../../../features/products/productThunk";

const DashboardHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { adminOrders, loading } = useSelector(state => state.orders); 
  const { adminProducts } = useSelector((state) => state.product);
  console.log(adminOrders,adminProducts)
  useEffect(() => {
    if (!adminOrders?.length) {
      dispatch(fetchAdminOrdersThunk());
    }
    if (!adminProducts?.length) {
      dispatch(fetchAdminProductsThunk());
    }
  }, [
    dispatch, adminOrders, adminProducts
  ]);

  const lowStockProducts = adminProducts.filter(
    (product) => product.stock <= 5 && product.stock > 0 );

  const outOfStockProducts =  adminProducts.filter(
    (product) => product.stock === 0);

  const totalCommission = adminOrders.reduce
  ((sum, order) => 
    sum + order.orderItems.reduce
      ((itemSum, item) =>
        itemSum + (item.commissionAmount || 0),
      0), 
    0);

  const recentOrders = adminOrders?.filter
  (order => order.paymentStatus === "paid").slice(0,10);

  const totalOrders = adminOrders.filter(
    o => o.paymentStatus === "paid"
  ).length; 

  const totalRevenue = adminOrders.reduce(
    (sum, order) =>
    order.paymentStatus === "paid" ?
      sum + order.sellerRevenue : sum, 0
    );

  const totalEarnings = adminOrders.reduce(
    (sum, order) =>
      order.paymentStatus === "paid" ?
      sum + order.sellerEarnings : sum, 0
    );
  
  const deliveredOrder = adminOrders.filter
    (o => o.orderStatus === "delivered").length;

  const pendingOrders = totalOrders - deliveredOrder;
  
  if (loading) { return <Loader />; }

  const statusCounts = {
    processing: 0,
    packed: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };

  const productMap = {};

  adminOrders.forEach((order) => {
    const sellerItems = order.orderItems;
    sellerItems.forEach((item) => {
      statusCounts[item.itemStatus]++;
    });

    order.orderItems.forEach((item) => {
      if (!item.product) return;
      const productId = item.product?._id || item._id;
      if (!productId) return;
      if (!productMap[productId]) {
        productMap[productId] = {
          title: item.product?.title || item.productTitle,
          quantitySold: 0,
          revenue: 0,
        };
      }
      productMap[productId].quantitySold += item.quantity;
      productMap[productId].revenue +=
        item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productMap)
  .sort((a, b) => b.quantitySold - a.quantitySold)
  .slice(0, 5);

  return (
    <div className="dashboard-home">
      <h1>Dashboard Overview</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>
            ₹{totalRevenue}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p>₹{totalEarnings}</p>
        </div>

        <div className="stat-card">
          <h3>Commission paid</h3>
          <p>
            {totalCommission.toFixed(2)}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>
            {totalOrders}
          </p>
        </div>

        <div className="stat-card">
          <h3>Delivered Orders</h3>
          <p>{deliveredOrder}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{pendingOrders}</p>
        </div>
        
      </div>

      <div className="recent-orders">
        <div className="section-header">
          <h2>Recent Orders</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td>
                    #{order._id.slice(-6)}
                  </td>
                  <td>
                    {order.customer?.name}
                  </td>
                  <td>
                    ₹{order.sellerRevenue}
                  </td>
                  <td>
                    {order.orderStatus}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-bottom">
        <div className="top-products">
          <h2>Top Selling Products</h2>

          {topProducts.map((product,index) => (
            <div key={index} className="product-row">
              <div> {product.title} </div>
              <div> Sold: {product.quantitySold} </div>
              <div> ₹{product.revenue} </div>
            </div>
          ))}
        </div>
        
        <div className="status-summary">
          <h2>Order Status Distribution</h2>

          <div className="status-item">
            <span>Processing</span>
            <span>{statusCounts.processing}</span>
          </div>

          <div className="status-item">
            <span>Packed</span>
            <span>{statusCounts.packed}</span>
          </div>

          <div className="status-item">
            <span>Shipped</span>
            <span>{statusCounts.shipped}</span>
          </div>

          <div className="status-item">
            <span>Delivered</span>
            <span>{statusCounts.delivered}</span>
          </div>

          <div className="status-item">
            <span>Cancelled</span>
            <span>{statusCounts.cancelled}</span>
          </div>

        </div>
      </div>

      <div className="inventory-section">
        {/* LOW STOCK */}
        <div className="inventory-card">
          <h2>Low Stock Products</h2>

          {lowStockProducts.slice(0,10).map((product) => (
            <div
              key={product._id}
              className="inventory-product"
            >
              <img
                src={product.images?.[0]?.url}
                alt={product.title}
                className="inventory-image"
              />
              <div className="inventory-info">
                <h4>{product.title}</h4>
                <p>
                  Stock Left:
                  <span className="warning-stock">
                    {" "}
                    {product.stock}
                  </span>
                </p>
              </div>
              <button
                className="inventory-btn"
                onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
              >
                Edit Product
              </button>
            </div>
          ))}
        </div>
        {/* OUT OF STOCK */}
        <div className="inventory-card">
          <h2>Out Of Stock Products</h2>
          
          {outOfStockProducts.slice(0,10).map((product) => (
            <div
              key={product._id}
              className="inventory-product"
            >
              <img
                src={product.images?.[0]?.url}
                alt={product.title}
                className="inventory-image"
              />
              <div className="inventory-info">
                <h4>{product.title}</h4>
                <p>
                  Stock Left:
                  <span className="danger-stock">
                    {" "}
                    0
                  </span>
                </p>
              </div>
              <button
                className="inventory-btn restock"
                onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
              >
                Restock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;