import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../../../features/auth/authThunk";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state)=> state.auth);
  
  const { totalItems } = useSelector((state) => state.cart);

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
        <Link to="/"> Home </Link>
        <Link to="/products"> Products </Link>
        <span className="icon">
          <FaHeart />
        </span>
        <Link
        to="/cart"
        className="icon cart">
          <FaShoppingCart />
          <small>{ totalItems }</small>
        </Link>
        {
          isAuthenticated ? (
            <div className="user-menu">
              <span>
                {user?.name}
              </span>
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              <FaUser />
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
            onClick={()=>
              setMenuOpen(false)
            }
          > Home
          </Link>
          <Link
            to="/products"
            onClick={() =>
              setMenuOpen(false)
            }
          > Products
          </Link>
          <Link
            to="/cart"
            onClick={() =>
              setMenuOpen(false)
            }
          > Cart
          </Link>
          {
            isAuthenticated ? (
              <>
                <p>
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
