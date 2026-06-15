import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, 
  FaStore,
  FaShoppingCart,
  FaClipboardList,
  FaRegUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../../../features/auth/authThunk";
import toast from "react-hot-toast";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const totalItems = useSelector((state) => state.cart.totalItems);
  const totalOrders = useSelector((state) => state.orders.orders.length);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (location.pathname !== "/products") {
      setSearchValue("");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/products") {
      const searchParams = new URLSearchParams(location.search);
      setSearchValue(searchParams.get("search") || "");
    }
  }, [location.pathname, location.search]);

  const dashboardPath = user?.role === "superAdmin" ? "/super-admin" : "/dashboard";
  const dashboardLabel = user?.role === "superAdmin" ? "Super Admin" : "Dashboard";

  const handleLogout = async () => {
    const result = await dispatch(logoutThunk());
    if (result.success) {
      toast.success("Logged out successfully");
      setMenuOpen(false);
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    setMenuOpen(false);
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        ShopHub
      </Link>

      <form className="search-box" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <button type="submit" aria-label="Search products">
          <FaSearch />
        </button>
      </form>

      <div className="nav-actions">
        <Link to="/" className="icon-pill">
          <FaHome />
          <span>Home</span>
        </Link>
        <Link to="/products" className="icon-pill">
          <FaStore />
          <span>Products</span>
        </Link>

        {isAuthenticated ? (
          <>
            {user?.role === "user" && (
              <Link to="/cart" className="icon-pill cart">
                <FaShoppingCart />
                <span>Cart</span>
                <small>{totalItems}</small>
              </Link>
            )}
            {user?.role === "user" && (
              <Link to="/orders" className="icon-pill">
                <FaClipboardList />
                <span>Orders</span>
                <small>{totalOrders}</small>
              </Link>
            )}

            {user?.role !== "user" && (
              <Link to={dashboardPath} className="icon-pill">
                <FaUserCircle />
                <span>{dashboardLabel}</span>
              </Link>
            )}

            <div className="user-menu">
              <span className="user-chip">
                <FaRegUser />
                {user?.name}
              </span>
              <button className="logout-btn" onClick={handleLogout} type="button">
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="icon-pill auth-link">
            <FaRegUser />
            <span>Login</span>
          </Link>
        )}
      </div>

      <button
        className="menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>

          <Link to="/" className="icon home" onClick={closeMenu}>
            <FaHome />
            Home
          </Link>
          <Link to="/products" className="icon product" onClick={closeMenu}>
            <FaStore />
            Products
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === "user" && (
                <>
                  <Link to="/cart" className="icon cart" onClick={closeMenu}>
                    <FaShoppingCart />
                    Cart <small>{totalItems}</small>
                  </Link>
                  <Link to="/orders" className="icon order" onClick={closeMenu}>
                    <FaClipboardList />
                    Orders <small>{totalOrders}</small>
                  </Link>
                </>
              )}

              {user?.role !== "user" && (
                <Link to={dashboardPath} className="icon order" onClick={closeMenu}>
                  <FaUserCircle />
                  {dashboardLabel}
                </Link>
              )}

              <p className="mobile-user">
                <FaRegUser />
                {user?.name}
              </p>

              <button className="logout-btn mobile-logout" onClick={handleLogout} type="button">
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
