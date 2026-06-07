import './ProductCard.css';
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import useAddToCart from '../../../hooks/useAddToCart';

const ProductCard = ({ product }) => {
  if(!product){ return null; }
  const { addToCart } = useAddToCart();

  return (
    <div className="product-card">
      <Link
        to={`/products/${product._id}`}
        className="product-link"
      >
        <img 
          src={product?.images?.[0]?.url} 
          alt ={product.title} 
        />
        <div className="product-body">
          <span className="category">
            {product.category}
          </span>
          <h3>
            {product.title}
          </h3>
          <div className="rating">
            <FaStar />
            <span>{product.averageRating}</span>
          </div>
          <div className="price-box">
            <span className="price">
              ₹{product.price}
            </span>
          </div>
        </div>
      
      </Link>
      <button className="cart-btn" onClick={() => {
        addToCart(product)
      }}
      >
        Add To Cart
      </button>
    </div>
  );
};

export default ProductCard;