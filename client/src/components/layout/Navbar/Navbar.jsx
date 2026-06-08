import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaStore, FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars,  FaClipboardList, FaUserCircle, FaRegUser } from "react-icons/fa";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../../../features/auth/authThunk";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state)=> state.auth);
  
  const { totalItems, totalOrders } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await dispatch(logoutThunk());
    if (result.success) {
      toast.success("Logged Out Successfully");
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <nav className="navbar">
      
      <Link 
      to="/" 
      className="logo">
        ShopHub
      </Link>
      <div className="search-box">
        <input 
          type="text"
          placeholder="Search products..."
        />
        <button>
          <FaSearch />
        </button>
      </div>      

      <div className="nav-actions">
        <Link 
        to="/"
        className="icon home">
          <FaHome /> 
        </Link>
        <Link 
          to="/products" 
          className="icon products"
        > <FaStore />
        </Link>
        <Link 
          to=""
          className="icon heart">
          <FaHeart />
        </Link>
        {
          isAuthenticated ? (
          <>
          <Link
            to="/cart"
            className="icon cart">
            <FaShoppingCart />
            <small>{ totalItems }</small>
          </Link>
          <Link 
            to="/orders" 
            className="icon orders">
            <FaClipboardList  />
            <small>{ totalOrders }</small>
          </Link>
            <div className="user-menu">
              <span>
                <FaUser />
              </span>
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
          ) : (
            <Link
              to="/login"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              <FaRegUser />
            </Link>
          )
        }
      </div>

      <button
        className="menu-btn"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }>
        {menuOpen ? (
          <FaTimes />
        ) : (
          <FaBars />
        )}
      </button>

      {menuOpen && (
        <div  className="mobile-menu">
          <Link
            to="/"
            className="icon home"
            onClick={()=>
              setMenuOpen(false)
            }> 
            Home <FaHome />
          </Link>
          <Link
            to="/products"
            className="icon product"
            onClick={() =>
              setMenuOpen(false)
            }> 
            Products <FaStore />
          </Link>
          {
            isAuthenticated ? (
              <>
              <Link
                to=""
                className="icon heart"
                onClick={() =>
                  setMenuOpen(false)
                }> 
                wishlist <FaHeart />
              </Link>
              <Link
                to="/cart"
                className="icon cart"
                onClick={() =>
                  setMenuOpen(false)
                }> 
                Cart <FaShoppingCart />
              </Link>
                <Link
                  to="/orders"
                  className="icon order"
                  onClick={() =>
                    setMenuOpen(false)
                  }>
                  Cart <FaClipboardList />
                </Link>
                <p>
                  <FaUser />
                  {user?.name}
                </p>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Login
              </Link>
            )
          }
        </div>  
      )}
    </nav>

  );
}

export default Navbar;
