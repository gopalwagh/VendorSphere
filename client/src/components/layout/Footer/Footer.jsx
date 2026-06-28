import "./Footer.css";
import { Link } from "react-router-dom";
import {
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3>VendorSphere</h3>
          <p>
            A polished e-commerce experience for modern buyers, sellers, and
            operators.
          </p>
          <div className="footer-connect">
            <h4>Connect</h4>
            <div className="footer-social">
              <a
                href="https://www.linkedin.com/in/gopal-wagh-9ba402385/?skipRedirect=true"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://github.com/gopalwagh"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.instagram.com/gopal_wagh97/?hl=en"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>
              <a href="mailto:waghgopal9860@gmail.com">
                <FaEnvelope />
              </a>
            </div>
          </div>
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

      

      <div className="footer-bottom">
        © 2026 VendorSphere
        Built with React, Node.js, MongoDB and ❤️ by Gopal Wagh.
      </div>
    </footer>
  );
};

export default Footer;
