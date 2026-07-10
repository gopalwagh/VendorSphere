import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Register from "../pages/Register/Register.jsx";
import Products from "../pages/Products/Products.jsx";
import ProductDetails from "../pages/ProductDetails/ProductDetails.jsx";
import Profile from "../pages/Profile/Profile.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Checkout from "../pages/Checkout/Checkout.jsx";
import Orders from "../pages/Orders/Orders.jsx";
import OrderDetails from "../pages/orderDetails/OrderDetails.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import ManageOrders from "../pages/Dashboard/ManageOrders/ManageOrders.jsx";
import Coupons from "../pages/superAdmin/Coupons.jsx";
import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome.jsx"
import ManageProducts from "../pages/Dashboard/ManageProducts/ManageProducts.jsx"
import Analytics from "../pages/Dashboard/Analytics/Analytics.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx"
import NotFound from "../pages/NotFound/NotFound.jsx";
import CreateProduct from "../pages/Dashboard/CreateProduct/CreateProduct.jsx";
import SellerApprovedRoute from "./SellerRoutes.jsx";
import Users from "../pages/superAdmin/Users.jsx";
import ApprovedSellers from "../pages/superAdmin/ApprovedSellers.jsx"
import SellerApplications from "../pages/superAdmin/SellerApplications.jsx";
import SuperAdminDashboard from "../pages/superAdmin/SuperAdminDashboard.jsx";
import SuperAdminLayout from "../pages/superAdmin/SuperAdminLayout.jsx";
import SellerStatus from "../pages/sellers/SellerStatus.jsx";
import { ROLES } from "../features/auth/roleUtils.js";
import BusinessCopilotPage from "../pages/copilot/BusinessCopilotPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={ <MainLayout/> }>
        <Route path="/" element={ <Home/> } />
        <Route path="/login" element={ <Login/> } />
        <Route path="/register" element={ <Register/> } />
        <Route path="/products" element={ <Products/> } />
        <Route path="/products/:productId" element={ <ProductDetails/> } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
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
          <ProtectedRoute roles={[ROLES.SELLER]}>
            <SellerApprovedRoute>
              <DashboardLayout />
            </SellerApprovedRoute>
          </ProtectedRoute>
        } 
      >
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/edit/:productId" element={<CreateProduct />} />
        <Route path="products/create" element={<CreateProduct />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="copilot" element={<BusinessCopilotPage />} />
      </Route>
      
      <Route
        path="/seller/application"
        element={
          <ProtectedRoute roles={[ROLES.SELLER]}>
            <SellerStatus />
          </ProtectedRoute>
        }
      />

      <Route path="/super-admin"
        element={
          <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="applications" element={ <SellerApplications /> } />
        <Route path="approved-sellers" element={<ApprovedSellers />} /> 
        <Route path="users" element={<Users />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="copilot" element={<BusinessCopilotPage />} />
      </Route>

      {/* Catch-all NotFound */}
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
};

export default AppRoutes;
