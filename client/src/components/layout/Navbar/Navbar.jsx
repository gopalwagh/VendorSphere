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
import { ROLES, getRoleHomePath, getRoleLabel, normalizeRole } from "../../../features/auth/roleUtils";

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
  const normalizedRole = normalizeRole(user?.role);
  const isUser = normalizedRole === ROLES.USER;
  const dashboardPath = getRoleHomePath(normalizedRole);
  const dashboardLabel =
    normalizedRole === ROLES.SUPER_ADMIN
      ? getRoleLabel(normalizedRole)
      : "Seller Dashboard";

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

  const profilePath = "/profile";

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
        VendorSphere
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
            {isUser && (
              <Link to="/cart" className="icon-pill cart">
                <FaShoppingCart />
                <span>Cart</span>
                <small>{totalItems}</small>
              </Link>
            )}
            {isUser && (
              <Link to="/orders" className="icon-pill">
                <FaClipboardList />
                <span>Orders</span>
                <small>{totalOrders}</small>
              </Link>
            )}

            {!isUser && (
              <Link to={dashboardPath} className="icon-pill">
                <FaUserCircle />
                <span>{dashboardLabel}</span>
              </Link>
            )}

            <div className="user-menu">
              {isUser && (
                <Link to={profilePath} className="user-chip">
                  <FaRegUser />
                  {user?.name}
                </Link>
              )}
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
              {isUser && (
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

              {!isUser && (
                <Link to={dashboardPath} className="icon order" onClick={closeMenu}>
                  <FaUserCircle />
                  {dashboardLabel}
                </Link>
              )}

              <Link to={profilePath} className="mobile-user" onClick={closeMenu}>
                <FaRegUser />
                {user?.name}
              </Link>

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
