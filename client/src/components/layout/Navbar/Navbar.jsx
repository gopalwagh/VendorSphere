import "./Navbar.css";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link to="/products" >Products </Link>
        <span className="icon">
          <FaHeart />
        </span>
        <Link
        to="/cart"
        className="icon cart">
          <FaShoppingCart />
          <small>0</small>
        </Link>
        <Link to="/login" className="icon">
          <FaUser />
        </Link>
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
          <Link
            to="/login"
            onClick={() =>
              setMenuOpen(false)
            }
          > Login
          </Link>

        </div>  
      )}
    </nav>

  );
}

export default Navbar;
