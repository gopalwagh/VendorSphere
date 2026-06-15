import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3>ShopHub</h3>
          <p>
            A polished e-commerce experience for modern buyers, sellers, and
            operators.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
        </div>

        <div>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>

      <div className="footer-bottom">Copyright 2026 ShopHub. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
