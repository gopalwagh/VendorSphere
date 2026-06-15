import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Orders from "../pages/Orders/Orders.jsx";
import OrderDetails from "../pages/orderDetails/OrderDetails.jsx";
import DashboardLayout from "../layouts/DashboardLayout";
import ManageOrders from "../pages/Dashboard/ManageOrders/ManageOrders";
import Coupons from "../pages/superAdmin/Coupons.jsx";
import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome.jsx"
import ManageProducts from "../pages/Dashboard/ManageProducts/ManageProducts"
import Analytics from "../pages/Dashboard/Analytics/Analytics";
import ProtectedRoute from "./ProtectedRoute.jsx"
import NotFound from "../pages/NotFound/NotFound.jsx";
import CreateProduct from "../pages/Dashboard/CreateProduct/CreateProduct.jsx";
import SellerApprovedRoute from "./SellerRoutes.jsx";
import SellerRejected from "../pages/sellers/SellerRejected.jsx";
import SellerPending from "../pages/sellers/SellerPending.jsx";
import SellerApplication from "../pages/sellers/SellerApplication.jsx";
import Users from "../pages/superAdmin/Users.jsx";
import ApprovedSellers from "../pages/superAdmin/ApprovedSellers.jsx"
import SellerApplications from "../pages/superAdmin/SellerApplications.jsx";
import SuperAdminDashboard from "../pages/superAdmin/SuperAdminDashboard.jsx";
import SuperAdminLayout from "../pages/superAdmin/SuperAdminLayout.jsx";
import SellerStatus from "../pages/sellers/SellerStatus.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={ <MainLayout/> }>
        <Route path="/" element={ <Home/> } />
        <Route path="/login" element={ <Login/> } />
        <Route path="/register" element={ <Register/> } />
        <Route path="/products" element={ <Products/> } />
        <Route path="/products/:productId" element={ <ProductDetails/> } />
        <Route path="/cart" element ={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>} 
        />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }/>
        <Route path="/orders/:orderId" element={<OrderDetails />}/>
      </Route>

      {/* DashBoard Layout Routes  */}
      <Route path="/dashboard" element={ 
          <ProtectedRoute roles={["admin"]}>
            <SellerApprovedRoute>
              <DashboardLayout />
            </SellerApprovedRoute>
          </ProtectedRoute>
        } 
      >
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/edit/:productId" element={<CreateProduct />} />
        <Route path="products/create" element={<CreateProduct />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      
      <Route
        path="/seller/application"
        element={
          <ProtectedRoute roles={["admin"]}>
            <SellerStatus />
          </ProtectedRoute>
        }
      />

      <Route path="/super-admin"
        element={
          <ProtectedRoute roles={["superAdmin"]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="applications" element={ <SellerApplications /> } />
        <Route path="approved-sellers" element={<ApprovedSellers />} /> 
        <Route path="users" element={<Users />} />
        <Route path="coupons" element={<Coupons />} />
      </Route>

      {/* Catch-all NotFound */}
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
};

export default AppRoutes;