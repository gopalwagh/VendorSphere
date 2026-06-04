import './ProductCard.css';
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ProductCard = () => {
  return (
    <div className="product-card">
      <Link
        to="/products/1"
        className="product-link"
      >
        <img 
          src="https://picsum.photos/300" 
          alt ="product" 
        />
        <div className="product-body">
          <span className="category">
            Electronics
          </span>
          <h3>
            Wireless Headphones
          </h3>
          <div className="rating">
            <FaStar />
            <span>4.5</span>
          </div>
          <div className="price-box">
            <span className="price">
              ₹2999
            </span>
            <span className="old-price">
              ₹4999
            </span>
          </div>
        </div>
      
      </Link>
      <button className="cart-btn">
        Add To Cart
      </button>
    </div>
  );
};

export default ProductCard;